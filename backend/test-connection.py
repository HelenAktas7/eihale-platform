import oracledb

# Eğer client klasörünü manuel verdiysen:
# oracledb.init_oracle_client(lib_dir=r"C:\Oracle\instantclient_21_18")

try:
    connection = oracledb.connect(
        user="system",
        password="34281",
        dsn="localhost/XEPDB1"
    )
    print("Oracle bağlantısı başarılı!")
    connection.close()
except Exception as e:
    print("Bağlantı hatası:", e)

