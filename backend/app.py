from flask import Flask, jsonify, request
from db import (
    get_teklifler_by_ihale_id,
    get_all_kullanicilar,
    insert_kullanici,
    insert_ihale,
    insert_teklif,
    get_all_ihaleler,
    get_kazananlar 
)

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify(message="E-Ihale sistemi basariyla calisiyor!")

@app.route('/kullanicilar', methods=['GET'])
def get_kullanicilar():
    try:
        kullanicilar = get_all_kullanicilar()
        return jsonify([
            {"id": k[0], "isim": k[1], "email": k[2]}
            for k in kullanicilar
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/kullanici', methods=['POST'])
def yeni_kullanici_ekle():
    veri = request.get_json()
    isim = veri.get("isim")
    email = veri.get("email")

    if not isim or not email:
        return jsonify({"message": "İsim ve email gerekli"}), 400

    try:
        user_id = insert_kullanici(isim, email)
        return jsonify({"message": "Kullanici eklendi", "id": user_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ihale', methods=['POST'])
def yeni_ihale_ekle():
    veri = request.get_json()
    try:
        ihale_id = insert_ihale(
            veri["baslik"],
            veri["aciklama"],
            veri["baslangic_tarihi"],
            veri["bitis_tarihi"],
            veri["olusturan_id"]
        )
        return jsonify({"message": "Ihale eklendi", "id": ihale_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/teklif', methods=['POST'])
def yeni_teklif_ekle():
    veri = request.get_json()
    try:
        teklif_id = insert_teklif(
            veri["ihale_id"],
            veri["kullanici_id"],
            veri["tutar"]
        )
        return jsonify({"message": "Teklif eklendi", "id": teklif_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ihaleler/<ihale_id>/teklifler', methods=['GET'])
def get_teklifler_by_ihale(ihale_id):
    try:
        teklifler = get_teklifler_by_ihale_id(ihale_id)
        if not teklifler:
            return jsonify({"message": "Bu ihaleye ait teklif bulunamadi"}), 404

        return jsonify([
            {
                "teklif_id": t[0],
                "ihale_id": t[1],
                "kullanici_id": t[2],
                "tutar": t[3],
                "tarih": str(t[4])
            }
            for t in teklifler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    from db import get_all_ihaleler  # Üste ekle

@app.route('/ihaleler', methods=['GET'])
def tum_ihaleleri_getir():
    try:
        ihaleler = get_all_ihaleler()
        return jsonify([
            {
                "id": i[0],
                "baslik": i[1],
                "aciklama": i[2],
                "baslangic_tarihi": str(i[3]),
                "bitis_tarihi": str(i[4]),
                "olusturan_id": i[5]
            }
            for i in ihaleler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/kazananlar', methods=['GET'])
def kazananlari_getir():
    try:
        kazananlar = get_kazananlar()
        if not kazananlar:
            return jsonify({"message": "Henuz kazanan yok"}), 404

        return jsonify([
            {
                "ihale_id": k[0],
                "teklif_id": k[1],
                "kullanici_id": k[2],
                "teklif_miktari": k[3],
                "baslik": k[4],
                "bitis_tarihi": str(k[5])
            }
            for k in kazananlar
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
