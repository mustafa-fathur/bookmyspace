const { Op, where } = require('sequelize');
const moment = require('moment');
const sequelize = require('sequelize');
const { Role, User, Ruangan, Peminjaman, DetailPeminjaman, Notifikasi } = require('../models');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const libreConvert = require('libreoffice-convert');
const pusher = require('../utils/pusherConfig');
const ejs = require('ejs');
const pdf = require('html-pdf');
const schedule = require('node-schedule');

const formPinjamRuangan = async (req, res, next) => {
  try {
      let user = null;
      if (req.user) {
        const userId = req.user.idUser;
        user = await User.findOne({ where: { idUser: userId } });
      }
      const idRuangan = req.params.idRuangan;
      const ruangans = await Ruangan.findAll();
      const selectedRuangan = ruangans.find(ruangan => ruangan.idRuangan === idRuangan);

      let ruangan;
      if (idRuangan) {
          ruangan = await Ruangan.findOne({ where: { idRuangan: idRuangan } });
      }

      if (idRuangan && !ruangan) {
          res.status(404).json({ message: 'Ruangan not found' });
      } else {
        if(user) {
          res.render('user/pinjam-ruangan', { activePage: 'daftar-ruangan', user, ruangan, ruangans, selectedRuangan })
        } else {
          res.render('pinjam-ruangan', { activePage: 'peminjaman', ruangan, ruangans, selectedRuangan });
        }
      }

  } catch (error) {
      next(error);
  }
}

const pinjamRuangan = async (req, res, next) => {
  try {
      const user = req.user.idUser;
      const { namaRuangan, kegiatan, tanggal, waktuMulai, waktuSelesai } = req.body;
      const idRuangan = req.params.idRuangan || namaRuangan;

      const idPeminjam = await User.findOne({ where: { idUser: user } });

      if (!idPeminjam) {
          return res.status(404).json({ message: 'User not found' });
      }

      const ruangan = await Ruangan.findOne({ where: { idRuangan: idRuangan } });

      if (!ruangan) {
          return res.status(404).json({ message: 'Ruangan not found' });
      }

      const formulir = req.file ? req.file.filename : null;
      const pdfFileName = formulir;
      const pathPDFFile = `uploads/formulir/${pdfFileName}`;
      
      const statusPengajuan = 'Menunggu';

      let tanggalPengajuan = new Date().toLocaleDateString();


      const newPeminjaman = await Peminjaman.create({
          idPeminjam: idPeminjam.idUser,
          kegiatan,
          formulir,
          tanggalPengajuan,
          statusPengajuan,
          tanggalKeputusan: null,
          alasanPenolakan: null
      });

      const newDetailPeminjaman = await DetailPeminjaman.create({
          idPeminjaman: newPeminjaman.idPeminjaman,
          idRuangan: ruangan.idRuangan,
          tanggal,
          jamMulai: waktuMulai,
          jamSelesai: waktuSelesai
      });

      return res.redirect('/user/daftar-ruangan')
  } catch (error) {
      next(error);
  }
};

const dataPeminjaman = async (req, res, next) => {
  try {
    const userId = req.user.idUser;
    const user = await User.findOne({ where: { idUser: userId } });
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

    const peminjamans = await Peminjaman.findAll({
      where: {
        idPeminjam: userId,
        [Op.or]: [
          { statusPengajuan: 'Menunggu' },
          {
            statusPengajuan: 'Disetujui',
            [Op.or]: [
              { '$detailPeminjaman.tanggal$': { [Op.gt]: currentDateTime.split(' ')[0] } },
              {
                '$detailPeminjaman.tanggal$': currentDateTime.split(' ')[0],
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn('CONCAT', 
                      sequelize.col('detailPeminjaman.tanggal'), 
                      ' ', 
                      sequelize.col('detailPeminjaman.jamSelesai')
                    ),
                    { [Op.gt]: currentDateTime }
                  )
                ]
              }
            ]
          }
        ]
      },
      attributes: ['idPeminjaman', 'kegiatan', 'formulir', 'statusPengajuan'],
      include: [
        {
          model: DetailPeminjaman,
          as: 'detailPeminjaman',
          attributes: ['tanggal', 'jamMulai', 'jamSelesai'],
          include: [
            {
              model: Ruangan,
              as: 'ruangan',
              attributes: ['namaRuangan'],
            },
          ],
        },
      ],
    });
    
    res.render('user/data-peminjaman', { activePage:'data-peminjaman', user, peminjamans });
  } catch (error) {  
    next(error);
  }
};  

const detailPeminjaman = async (req, res, next) => {
  try {
    const userId = req.user.idUser;
    const idPeminjaman = req.params.idPeminjaman;

    const user = await User.findOne({ where: { idUser: userId } });

    const peminjaman = await Peminjaman.findOne({where: {idPeminjaman},
      attributes: ['idPeminjaman', 'kegiatan', 'statusPengajuan', 'tanggalPengajuan', 'formulir'],
      include: [
      {
        model: User,
        as: 'peminjam',
        attributes: ['nama', 'username', 'noHp', 'gender'],
      },
      {
        model: User,
        as: 'admin',
        attributes: ['nama'],
      },
      {
        model: DetailPeminjaman,
        as: 'detailPeminjaman',
        attributes: ['tanggal', 'jamMulai', 'jamSelesai'],
        include: [
          {
            model: Ruangan,
            as: 'ruangan',
            attributes: ['namaRuangan'],
          },
        ],
      },
      ],
    });

  const adminRoleId = await Role.findOne({ where: { namaRole: 'admin' } }).then(role => role.idRole);
  const userRoleId = await Role.findOne({ where: { namaRole: 'user' } }).then(role => role.idRole);
  
  if(user.idRole === userRoleId) {
      res.render('user/detail-peminjaman', { activePage:'data-peminjaman', user, peminjaman });
  } else if(user.idRole === adminRoleId) {
      res.render('admin/detail-peminjaman', { currentPage: 'peminjaman', user, peminjaman });
  }
  } catch (error) {  
    next(error);
  }
};


const batalPeminjaman = async (req, res, next) => {
  const { idPeminjaman } = req.params;

  try {
      const peminjaman = await Peminjaman.findOne({ where: { idPeminjaman } });

      if (!peminjaman) {
          return res.status(404).json({ message: 'Peminjaman not found' });
      }

      await peminjaman.destroy();

      return res.redirect('/user/data-peminjaman');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error cancelling peminjaman');
  }
};

const sendNotification = async (idUser, message) => {
  await Notifikasi.create({ idUser: idUser, message });
  pusher.trigger('notifications', 'tolak-peminjaman', {
    idUser,
    message,  
  });
};

const approvePeminjaman = async (req, res, next) => {
  try {
    const idPeminjaman = req.params.idPeminjaman;
    console.log('idPeminjaman:', idPeminjaman);

    const idAdmin = req.user.idUser;
    console.log('idAdmin:', idAdmin);

    const peminjaman = await Peminjaman.findByPk(idPeminjaman, {
      include: [
        {
          model: User,
          as: 'peminjam',
          attributes: ['idUser', 'nama', 'username', 'noHp'],
        },
        {
          model: DetailPeminjaman,
          as: 'detailPeminjaman',
          include: [
            {
              model: Ruangan,
              as: 'ruangan'
            }
          ]
        }
      ]
    });

    if (!peminjaman) {
      return res.status(404).json({ message: 'Peminjaman not found' });
    }

    console.log(peminjaman);


    const templatePath = path.resolve("public/templates", "template_surat_peminjaman.docx");
    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });

    doc.setData({
      dsi: "Departemen Sistem Informasi",
      id: peminjaman.idPeminjaman,
      nama: peminjaman.peminjam.nama,
      acara: peminjaman.kegiatan,
      tanggal: new Date(peminjaman.detailPeminjaman[0].tanggal).toLocaleDateString(),
      ruangan: peminjaman.detailPeminjaman[0].ruangan.namaRuangan,
      jamMulai: peminjaman.detailPeminjaman[0].jamMulai,
      jamSelesai: peminjaman.detailPeminjaman[0].jamSelesai,
      tanggalKeputusan: new Date().toLocaleDateString()
    });

    doc.render();

    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    const outputDir = path.resolve("public/downloads/surat");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${peminjaman.idPeminjaman}.docx`);
    fs.writeFileSync(outputPath, buffer);

    
    const username = peminjaman.peminjam.username;
    const nama = peminjaman.peminjam.nama;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}`;
    const filename = `${username}_${nama}_${formattedDate}.pdf`
    const pdfPath = path.join(outputDir, filename);     

    libreConvert.convert(fs.readFileSync(outputPath), '.pdf', undefined, async(err, done) => {
      if (err) {
        console.error('Error during PDF generation:', err);
        return res.status(500).json({ error: 'Error during PDF generation' });
      }

      fs.writeFileSync(pdfPath, done);
      console.log(`File converted successfully: ${pdfPath}`);

      fs.unlinkSync(outputPath);

      await Peminjaman.update(
        {
          idAdmin,
          statusPengajuan: 'Disetujui',
          tanggalKeputusan: new Date(),
          suratPeminjaman: filename
        },
        { where: { idPeminjaman } }
      );

      const detailPeminjaman = await DetailPeminjaman.findOne({ where: { idPeminjaman } });

      if (!detailPeminjaman) {
        return res.status(404).json({ message: 'DetailPeminjaman not found' });
      }

      await Ruangan.update(
        { statusKetersediaan: 'Dipinjam' },
        { where: { idRuangan: detailPeminjaman.idRuangan } }
      );

      const jamSelesai = peminjaman.detailPeminjaman[0].jamSelesai;
      const tanggal = peminjaman.detailPeminjaman[0].tanggal;

      const endDateTime = new Date(tanggal + ' ' + jamSelesai);

            schedule.scheduleJob(endDateTime, async function() {
              const detailPeminjaman = await DetailPeminjaman.findOne({ where: { idPeminjaman } });
      
              if (detailPeminjaman) {
                await Ruangan.update(
                  { statusKetersediaan: 'Tersedia' },
                  { where: { idRuangan: detailPeminjaman.idRuangan } }
                );
              }
            });
      
      const user = peminjaman.peminjam;
      console.log(user);
      sendNotification(user.idUser, `Peminjaman ruangan Anda dengan ID ${idPeminjaman} telah diterima oleh admin`);

      res.redirect('/admin/daftar-peminjaman');
    });
  } catch (error) {
    console.error('Error during PDF generation:', error);
    next(error);
  }
};

const daftarPeminjaman = async (req, res, next) => {
  try {
    const userId = req.user.idUser;
    const user = await User.findOne({ where: { idUser: userId } });

    const peminjamans = await Peminjaman.findAll({
      where: {statusPengajuan: 'Menunggu'},
      attributes: ['idPeminjaman', 'kegiatan', 'tanggalPengajuan', 'formulir'],
      include: [
      {
        model: User,
        as: 'peminjam',
        attributes: ['nama', 'username', 'noHp'],
      },
      {
        model: User,
        as: 'admin',
        attributes: ['nama'],
      },
      {
        model: DetailPeminjaman,
        as: 'detailPeminjaman',
        attributes: ['tanggal', 'jamMulai', 'jamSelesai'],
        include: [
          {
            model: Ruangan,
            as: 'ruangan',
            attributes: ['namaRuangan'],
          },
        ],
      },
    ],
  });
    res.render('admin/daftar-peminjaman', { currentPage: 'peminjaman', user, peminjamans });
  } catch (error) {
    next(error);
  }
};

const tolakPeminjamanForm = async (req, res, next) => {
  try {
    const userId = req.user.idUser;
    const user = await User.findOne({ where: { idUser: userId } });
    const idPeminjaman = req.params.idPeminjaman;

    res.render('admin/tolakPeminjaman', { currentPage: 'peminjaman', user, idPeminjaman });
  } catch (err) {
    next(err);
  }
};

const tolakPeminjaman = async (req, res, next) => {
    try {
        const idPeminjaman = req.params.idPeminjaman;
        const idAdmin = req.user.idUser;
        const alasanPenolakan = req.body.alasanPenolakan;

        const updatedPeminjaman = await Peminjaman.update(
            {
                idAdmin,
                statusPengajuan: 'Ditolak',
                tanggalKeputusan: new Date(), 
                alasanPenolakan: alasanPenolakan,
            },
            {
                where: { idPeminjaman }
            }
        );
        if (updatedPeminjaman[0] === 0) {
            return res.status(404).json({ message: 'Peminjaman not found' });
        }

        const peminjaman = await Peminjaman.findByPk(idPeminjaman, {
          include: [
            {model: User, as: 'peminjam', attributes: ['idUser', 'nama', 'username', 'noHp']},
          ]
        });


        const user = peminjaman.peminjam;
        sendNotification(user.idUser, `Peminjaman ruangan Anda dengan ID ${idPeminjaman} telah ditolak oleh admin. Alasan penolakan: ${alasanPenolakan}`);


        res.redirect('/admin/daftar-peminjaman');
    } catch (error) {
        next(error);
    }
};

const rekapPeminjaman = async (req, res, next) => {
    try {
        const userId = req.user.idUser;
        const user = await User.findOne({ where: { idUser: userId } });

        const peminjamans = await Peminjaman.findAll({
          where: {statusPengajuan: {[Op.not]: 'Menunggu'}},
          attributes: ['idPeminjaman', 'kegiatan', 'tanggalPengajuan', 'formulir', 'statusPengajuan'],
          include: [
          {
            model: User,
            as: 'peminjam',
            attributes: ['nama', 'username', 'noHp'],
          },
          {
            model: User,
            as: 'admin',
            attributes: ['nama'],
          },
          {
            model: DetailPeminjaman,
            as: 'detailPeminjaman',
            attributes: ['tanggal', 'jamMulai', 'jamSelesai'],
            include: [
              {
                model: Ruangan,
                as: 'ruangan',
                attributes: ['namaRuangan'],
              },
            ],
          },
        ],
      });
        res.render('admin/rekap-peminjaman', { currentPage : 'rekap-peminjaman', user, peminjamans });
      } catch (error) {
        next(error);
  }
 };

const downloadRekap = async (req, res, next) => {
  try {
    const userId = req.user.idUser; 
    const user = await User.findOne({ where: { idUser: userId } });

    const peminjamans = await Peminjaman.findAll({
      where: { statusPengajuan: { [Op.not]: 'Menunggu' } },
      attributes: ['idPeminjaman', 'kegiatan', 'tanggalPengajuan', 'tanggalKeputusan', 'formulir', 'statusPengajuan'],
      include: [
        {
          model: User,
          as: 'peminjam',
          attributes: ['nama', 'username', 'noHp'],
        },
        {
          model: User,
          as: 'admin',
          attributes: ['nama'],
        },
        {
          model: DetailPeminjaman,
          as: 'detailPeminjaman',
          attributes: ['tanggal', 'jamMulai', 'jamSelesai'],
          include: [
            {
              model: Ruangan,
              as: 'ruangan',
              attributes: ['namaRuangan'],
            },
          ],
        },
      ],
    });

    const currentPage = 'rekap';

    const templatePath = path.join(__dirname, '../views/admin/template-rekap.ejs');
    const html = await ejs.renderFile(templatePath, { currentPage, user, peminjamans });

    const pdfPath = path.join(__dirname, '../public/downloads/rekap.pdf');
    pdf.create(html).toFile(pdfPath, (err, result) => {
      if (err) {
        return next(err);
      }
      res.download(result.filename);
    });
  } catch (error) {
    next(error);
  }
};
 
const downloadSurat = async (req, res, next) => {
  
  try {
    const { idPeminjaman } = req.params;
    const peminjaman = await Peminjaman.findByPk(idPeminjaman);

    if(!peminjaman) {
      return res.status(404).json({ message: 'Peminjaman not found' });
    }

    const filePath = path.resolve('public/downloads/surat', peminjaman.suratPeminjaman);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath);
 } catch (error) {
    next(error);
  }
};


module.exports = {
    formPinjamRuangan,
    pinjamRuangan,
    dataPeminjaman,
    detailPeminjaman,
    batalPeminjaman,
    daftarPeminjaman,
    approvePeminjaman,
    tolakPeminjamanForm,
    tolakPeminjaman,
    rekapPeminjaman,
    downloadRekap,
    downloadSurat
}