from db import get_teklifler_by_ihale_id
if __name__ == "__main__":
    ihale_id="362238dd-2959-4c1e-a54e-66f7ef587364"
    teklifler=get_teklifler_by_ihale_id(ihale_id)

    if teklifler:
        print(f"{ihale_id} icin teklifler :")
        for teklif in teklifler:
                print(f"Teklif ID       : {teklif[0]}")
                print(f"Ihale ID        : {teklif[1]}")
                print(f"Kullanici ID    : {teklif[2]}")
                print(f"Teklif Tutarı   : {teklif[3]} TL")
                print(f"Tarih           : {teklif[4]}")
                print("-" * 40)

    else:
        print(f"{ihale_id} icin teklif bulunamadi.")    




