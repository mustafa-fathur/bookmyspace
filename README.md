# Web Peminjaman Ruangan: BookMySpace

## How to use

1. **Clone repository**

   ```bash
   git clone https://github.com/NaufalAD13/Tugas-Besar-PWEB-B-11.git
   ```

2. **Cd ke folder project**

   ```bash
   cd Tugas-Besar-PWEB-B-11
   ```

3. **Install node modules**

   ```bash
   npm install
   ```

4. **Isi variabel .env sesuai database, jwt secret code, dan pusher api key yang dimiliki**

   ```bash
    DB_HOST = localhost
    DB_NAME = ""
    DB_USERNAME = ""
    DB_PASSWORD = ""
    DB_CONNECTION = ""
    PORT = 
    NODE_ENV = ""

    JWT_SECRET = 
    JWT_COOKIE_EXPIRES_IN = 
    JWT_EXPIRES_IN = 

    PUSHER_APP_ID=
    PUSHER_APP_KEY=
    PUSHER_APP_SECRET=
    PUSHER_APP_CLUSTER=
   ```

5. **Lakukan migrasi tabel dari express ke database**

   ```bash
   npx sequelize-cli db:migrate
   ```

6. **Jalankan seeder untuk mengirim data ke database**

   ```bash
   npx sequelize-cli db:seed:all
   ```

7. **Jalankan Express dan tailwind di 2 terminal berbeda dengan perintah**

   ```bash
   npm run dev # untuk menjalankan express
   npm run build # untuk menjalankan tailwind
   ```
