import uuid
from datetime import datetime

class Kullanici:
    def __init__(self, isim, email):
        self.id = str(uuid.uuid4())
        self.isim = isim
        self.email = email

class Ihale:
    def __init__(self, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id):
        self.id = str(uuid.uuid4())
        self.baslik = baslik
        self.aciklama = aciklama
        self.baslangic_tarihi = baslangic_tarihi
        self.bitis_tarihi = bitis_tarihi
        self.olusturan_id = olusturan_id

class Teklif:
    def __init__(self, ihale_id, kullanici_id, teklif_miktari):
        self.id = str(uuid.uuid4())
        self.ihale_id = ihale_id
        self.kullanici_id = kullanici_id
        self.teklif_miktari = teklif_miktari
        self.tarih = datetime.now()
