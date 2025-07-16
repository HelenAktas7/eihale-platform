from models import Kullanici, Ihale, Teklif

from flask import Flask, jsonify,request

app = Flask(__name__)

kullanicilar = []
ihaleler = []
teklifler = []

kullanici1 = Kullanici("Ali can", "ali@example.com")
kullanicilar.append(kullanici1)

@app.route('/')

def home():
    return jsonify(message="E-Ihale sistemi basariyla calisiyor!")

@app.route('/kullanicilar', methods=['GET'])
def get_kullanicilar():
    return jsonify([
        {
            "id": k.id,
            "isim": k.isim,
            "email": k.email
        }
        for k in kullanicilar
    ])

@app.route('/ihaleler', methods=['GET'])
def get_ihaleler():
    return jsonify([
        {
            "id": i.id,
            "baslik": i.baslik,
            "aciklama": i.aciklama,
            "baslangic_tarihi": i.baslangic_tarihi,
            "bitis_tarihi": i.bitis_tarihi,
            "olusturan_id": i.olusturan_id
        }
        for i in ihaleler
    ])

@app.route('/ihale', methods=['POST'])
def create_ihale():
    data = request.get_json()
    yeni_ihale = Ihale(
        baslik=data['baslik'],
        aciklama=data['aciklama'],
        baslangic_tarihi=data['baslangic_tarihi'],
        bitis_tarihi=data['bitis_tarihi'],
        olusturan_id=data['olusturan_id']
    )
    ihaleler.append(yeni_ihale)
    return jsonify({"message": "Ihale olusturuldu", "id": yeni_ihale.id}), 201

@app.route('/kullanici', methods=['POST'])
def yeni_kullanici_ekle():
    veri = request.json
    isim = veri.get("isim")
    email = veri.get("email")

    if not isim or not email:
        return jsonify({"message": "İsim ve email gerekli"}), 400

    yeni_k = Kullanici(isim, email)
    kullanicilar.append(yeni_k)

    return jsonify({
        "message": "Kullanici basariyla eklendi",
        "id": yeni_k.id
    }), 201

@app.route('/teklif', methods=['POST'])
def teklif_ver():
    veri = request.json
    ihale_id = veri.get("ihale_id")
    kullanici_id = veri.get("kullanici_id")
    tutar = veri.get("tutar")

    if not ihale_id or not kullanici_id or not tutar:
        return jsonify({"message": "Eksik bilgi"}), 400

    ihale = next((i for i in ihaleler if i.id == ihale_id), None)
    kullanici = next((k for k in kullanicilar if k.id == kullanici_id), None)

    if not ihale or not kullanici:
        return jsonify({"message": "İhale veya kullanici bulunamadi"}), 404

    yeni_teklif = Teklif(ihale_id, kullanici_id, tutar)
    teklifler.append(yeni_teklif)

    return jsonify({
        "message": "Teklif basariyla verildi",
        "id": yeni_teklif.id
    }), 201
@app.route('/teklifler', methods=['GET'])
def get_teklifler():
    return jsonify([
        {
            "id": t.id,
            "ihale_id": t.ihale_id,
            "kullanici_id": t.kullanici_id,
            "tutar": t.tutar
        }
        for t in teklifler
    ])
@app.route('/kazanan/<ihale_id>', methods=['GET'])
def kazanan_teklif(ihale_id):
   
    ilgili_teklifler = [t for t in teklifler if t.ihale_id == ihale_id]

   
    if not ilgili_teklifler:
        return jsonify({"message": "Bu ihaleye ait teklif bulunamadi"}), 404

 
    en_yuksek = max(ilgili_teklifler, key=lambda t: t.tutar)

    return jsonify({
        "kazanan_teklif_id": en_yuksek.id,
        "kullanici_id": en_yuksek.kullanici_id,
        "ihale_id": en_yuksek.ihale_id,
        "tutar": en_yuksek.tutar
    })

if __name__ == '__main__':
    app.run(debug=True)
