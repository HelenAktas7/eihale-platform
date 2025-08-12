import bcrypt
import oracledb

connection = oracledb.connect(
    user="system",
    password="34281",
    dsn="localhost:1521/XEPDB1"
)
cursor = connection.cursor()

cursor.execute("SELECT ID, SIFRE FROM KULLANICILAR")
users = cursor.fetchall()

for user_id, sifre in users:
    if sifre.startswith("$2b$"): 
        continue
    hashed_sifre = bcrypt.hashpw(sifre.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    cursor.execute("UPDATE KULLANICILAR SET SIFRE = :sifre WHERE ID = :id",
                   {"sifre": hashed_sifre, "id": user_id})
    print(f"{user_id} şifresi hash'lendi.")

connection.commit()
cursor.close()
connection.close()

print("Tüm şifreler hash'lendi.")
