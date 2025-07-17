create table kullanicilar (
   id    varchar2(36) prımary key,
   isim  varchar2(100),
   email varchar2(100)
);

create table ihaleler (
   id               varchar2(36) prımary key,
   baslik           varchar2(200),
   aciklama         varchar2(500),
   baslangic_tarihi date,
   bitis_tarihi     date,
   olusturan_id     varchar2(36),
   foreıgn key ( olusturan_id )
      references kullanicilar ( id )
);

create table teklifler (
   id             varchar2(36) prımary key,
   ihale_id       varchar2(36),
   kullanici_id   varchar2(36),
   teklif_miktari number(10,2),
   teklif_tarihi  date default sysdate,
   foreıgn key ( ihale_id )
      references ihaleler ( id ),
   foreıgn key ( kullanici_id )
      references kullanicilar ( id )
);