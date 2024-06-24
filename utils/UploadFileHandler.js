const multer = require('multer');
const path = require('path');

const file_type = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let destination = 'public/uploads/';
      if(file.mimetype.includes('image')){
        destination = 'public/uploads/ruangan/';
      } else if(file.mimetype === 'application/pdf'){   
        destination = 'public/uploads/formulir/';
      }

      const isValidFormat = file_type[file.mimetype];
      let uploadError = new Error('Invalid image format');

      if(isValidFormat){
        uploadError = null;
      }

      cb(uploadError, destination)
    },
    filename: function (req, file, cb) {
      let prefix = '';
      if (file.mimetype.includes('image')) {
        prefix = 'ruangan_';
      } else if (file.mimetype === 'application/pdf') {
        prefix = 'formulir_';
      }

      const uniqueFile =  `${prefix}${file.originalname}-${Date.now()}${path.extname(file.originalname)}`
      cb(null, uniqueFile)
    }
})

const upload = multer({ storage: storage })

module.exports = upload;