//---Section of Global Constant---
const y1 = 150; //First Line
const y2 = 378; //Second Line
const x1 = 100;
const x2 = 260;
const x3 = 420;
const x4 = 580;
const x5 = 740;
const x6 = 900;
const x7 = 1060;
const y_shift = 30; //! Smeschenie po vertikali
const card_width = 142;
const card_heigth = 206;
const undo_x = 1200;
const undo_y = 150;
var allow_undo = true;
//---Section of Global Variables---
var last_shirt;
//---Section of User Functions---
//uluchshenyj randomaizer
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
//peremeshuvaet kolodu
function shuffle(arr) {
  for (var i = 0; i < arr.length; i++) {
    var j = getRandomInt(arr.length);
    var k = getRandomInt(arr.length);
    var t = arr[j];
    arr[j] = arr[k];
    arr[k] = t;
  }
  return arr;
}
//proverka cveta masti
function red_or_black(cart) {
  if (cart.includes("clubs") || cart.includes("spades")) return "black";
  if (cart.includes("diamond") || cart.includes("hearts")) return "red";
  if (cart.includes("placeholder")) return "placeholder";
}
//proverka masti
function take_suit(cart) {
  if (cart.includes("clubs")) return "clubs";
  if (cart.includes("spades")) return "spades";
  if (cart.includes("diamond")) return "diamond";
  if (cart.includes("hearts")) return "hearts";
  if (cart.includes("placeholder")) return "placeholder";
}
//vozvraschaet ves karty
function weight(name) {
  let weight = name.substring(name.length - 2);
  if (weight.includes("_")) weight = name.substring(name.length - 1);
  return parseInt(weight);
}
//predvaritelnoe napolnenie massiva nazvanij kart
function cards() {
  var crd = [];
  for (let i = 1; i <= 13; i++) {
    crd.push("clubs_" + i);
    crd.push("diamond_" + i);
    crd.push("hearts_" + i);
    crd.push("spades_" + i);
  }
  crd = shuffle(crd);
  crd = shuffle(crd);
  return crd;
}
//End functions

var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  },

  preload: function () {
    // здесь будет загрузка ресурсов

    this.load.atlas("placeholder", "assets/cards/placeholder.png", "assets/cards/placeholder_atlas.json");
    this.load.atlas("card_shirt", "assets/cards/card_shirt.png", "assets/cards/card_shirt_atlas.json");
    this.load.atlas("cards", "assets/cards/cards.png", "assets/cards/cards_atlas.json");
    this.load.svg("undo", "img/undo.svg");
    // this.load.img("img", "assets");
  },

  create: function () {
    this.scene.start("WorldScene");
  },
});

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: "WorldScene" });
  },

  preload: function () {},

  // здесь мы создадим сцену мира
  create: function () {
    this.crd = [];
    //levyj verhnij ugol закрытый
    this.deck12 = [];

    //levyj verhnij ugol открытый
    this.deck0 = [];

    this.shirt = []; //rubashka
    this.placehold = []; //placeholdery (cells)

    //sem osnovnyh mest
    this.deck1 = [];
    this.deck2 = [];
    this.deck3 = [];
    this.deck4 = [];
    this.deck5 = [];
    this.deck6 = [];
    this.deck7 = [];

    //finalnye placeholdery
    this.deck8 = [];
    this.deck9 = [];
    this.deck10 = [];
    this.deck11 = [];

    //Массив для возврата хода
    this.undo = [];
    // создаём объект с нулевым прототипом
    this.o = Object.create(null);

    //peremennye dlia peremeschenia pachki kart
    this.upcard = 0; //skolko kart lezhit sverhu

    //predvaritelnoe napolnenie massiva nazvanij kart
    this.crd = cards();

    // vykladka po kolonkam
    this.first_load();
    //Konec vykladki po kolodam

    this.input.on("pointerdown", this.startDrag, this);
  }, //End of create:

  //! nachinaem dvigat
  startDrag(pointer, targets) {
    this.dragObj = targets[0];
    //Секция обработки кнопки "Отмена хода"
    if (allow_undo && pointer.y > undo_y - 15 && pointer.y < undo_y + 15 && pointer.x > undo_x - 15 && pointer.x < undo_x + 15 && this.undo[this.undo.length - 1].pl > 0) this.undo_move();
    if (this.dragObj instanceof Phaser.GameObjects.Sprite) {
      this.input.off("pointerdown", this.startDrag, this);

      //секция обработки стартовых плейсхолдеров (левый верхний угол)
      //Если взаимодействуем с колодой
      if (this.dragObj.x == x1 && this.dragObj.y == y1) {
        //Если в колоде кончились карты
        if (this.dragObj.name == "placeholder") {
          //Перекидываем карты назад в колоду
          while (this.deck0.length > 1) {
            this.crd.push(this.deck0[this.deck0.length - 1].name);
            this.deck0[this.deck0.length - 1].destroy();
            this.deck0.pop();
          }
          //Возвращаем рубашку
          this.shirt[0].visible = true;
          this.deck0[0].plo = 0;
        }
        //Секция вытаскивания карт из колоды
        //Если в колоде есть карты (есть рубашка - рубашка пропадает когда карты кончились)
        if (this.dragObj.name == "shirt") {
          //Проверяем, если в колоде кончиличь карты - убираем рубашку
          if (this.crd.length > 0) {
            //Иначе продолжаем вытаскивать карты из колоды
            this.deck0[0].plo += 1; //Необходимо для правильной работы логики перемещения между массивами
            let name = this.crd.pop();
            this.deck0.push(this.add.sprite(x2, y1, "cards", name));
            this.deck0[this.deck0.length - 1].name = name;
            this.deck0[this.deck0.length - 1].weight = weight(name);
            this.deck0[this.deck0.length - 1].color = red_or_black(name);
            this.deck0[this.deck0.length - 1].suit = take_suit(name);
            this.deck0[this.deck0.length - 1].pl = 0;
            this.deck0[this.deck0.length - 1].sx = x2;
            this.deck0[this.deck0.length - 1].sy = y1;
            this.deck0[this.deck0.length - 1].depth = this.deck0.length - 1;
            this.deck0[this.deck0.length - 1].sd = this.deck0.length - 1;
            //console.log("FPC - " + this.deck12[this.deck12.length - 1].name);
            this.deck0[this.deck0.length - 1].setInteractive();
            if (this.crd.length == 0) this.shirt[0].visible = false;
          }
        }
        //конец секции обработки стартовых плейсхолдеров (левый верхний угол)
      } else {
        //Иначе, - Если взаимодействуем с остальными картами

        // console.log("Klick - name: " + this.dragObj.name);
        console.log("Klick - plc: " + eval("this.deck" + this.dragObj.pl + "[0].plc"));
        console.log("Klick - plo: " + eval("this.deck" + this.dragObj.pl + "[0].plo"));
        console.log("Klick - length: " + eval("this.deck" + this.dragObj.pl + ".length"));
        console.log("Klick - pl " + this.dragObj.pl);
        console.log("Klick - sy " + this.dragObj.sy);
        console.log("Klick - sd " + this.dragObj.sd);
        console.log("Klick - depth " + this.dragObj.depth);
        //!----------------------------------
        // var o;
        // eval("o = this.deck" + this.dragObj.pl + ".length - 1");
        // for (let i = 1; i <= o; i++) {
        //   console.log(eval("this.deck" + this.dragObj.pl + "[i].name"));
        // }
        //!----------------------------------

        //определяем количество карт сверху
        this.upcard = eval("this.deck" + this.dragObj.pl + ".length-1") - this.dragObj.sd;
        // console.log("UPCARD - " + this.upcard);
        this.input.on("pointermove", this.doDrag, this); //включение движения
      }
      this.input.on("pointerup", this.stopDrag, this);
    }
  },

  doDrag(pointer) {
    this.dragObj.x = pointer.x;
    this.dragObj.y = pointer.y;

    //поднимает карту над остальными если она последняя
    if (this.upcard == 0) {
      this.dragObj.depth = 25;
      //this.dragObj.scale = 1.05;
    } else {
      for (let i = 1; i < this.upcard + 2; i++) {
        eval("this.deck" + this.dragObj.pl + "[this.dragObj.sd + i-1].depth = 25 + i");
        // eval("this.deck" + this.dragObj.pl + "[this.dragObj.depth + i-1].scale = 1.05");
      }
    }
    //код ниже тянет пачку
    //если захватил больше одной карты
    if (this.upcard > 0) {
      for (let i = 1; i < this.upcard + 1; i++) /*цикл по картам сверху*/ {
        eval("this.deck" + this.dragObj.pl + "[this.dragObj.sd + i].x = pointer.x");
        eval("this.deck" + this.dragObj.pl + "[this.dragObj.sd + i].y = pointer.y + y_shift*i");
      }
    }
  },

  //функция, которая выполняется, когда отпускаешь кнопку мыши при перетаскивании
  stopDrag(pointer) {
    this.input.on("pointerdown", this.startDrag, this);
    this.input.off("pointermove", this.doDrag, this);
    this.input.off("pointerup", this.stopDrag, this);
    //this.dragObj.setDepth(0);

    if (this.dragObj.y < y1 + card_heigth / 2) {
      //верхние плейсхолдеры
      if (this.dragObj.x < x2 + card_width / 2) {
        this.dragObj.x = this.dragObj.sx;
        this.dragObj.y = this.dragObj.sy;
        this.dragObj.depth = this.dragObj.sd;
        //kod nizhe tianet pachku
        if (this.upcard > 0) {
          for (let i = 1; i < this.upcard + 1; i++) /*цикл po kartam sverhu*/ {
            eval("this.deck" + pl + "[this.dragObj.sd + i].x = this.dragObj.sx");
            eval("this.deck" + pl + "[this.dragObj.sd + i].y = this.dragObj.sy + y_shift*i");
            eval("this.deck" + pl + "[this.dragObj.sd + i].depth = this.dragObj.sd");
          }
        }
      }
      // ace placeholder 1
      if (this.dragObj.x > x2 + card_width / 2 && this.dragObj.x < 660) {
        this.finalmove(8, x4);
      }
      //ace placeholder 2
      if (this.dragObj.x > 659 && this.dragObj.x < 820) {
        this.finalmove(9, x5);
      }
      //ace placeholder 3
      if (this.dragObj.x > 819 && this.dragObj.x < 980) {
        this.finalmove(10, x6);
      }
      //ace placeholder 4
      if (this.dragObj.x > 979) {
        this.finalmove(11, x7);
      }
    } //нижние плейсхолдеры
    else {
      //placeholder-1
      if (this.dragObj.x < 180) {
        this.peremeschenie(1, x1);
      }
      //placeholder-2
      if (this.dragObj.x > 179 && this.dragObj.x < 340) {
        this.peremeschenie(2, x2);
      }
      //placeholder-3
      if (this.dragObj.x > 339 && this.dragObj.x < 500) {
        this.peremeschenie(3, x3);
      }
      //placeholder-4
      if (this.dragObj.x > 499 && this.dragObj.x < 660) {
        this.peremeschenie(4, x4);
      }
      //placeholder-5
      if (this.dragObj.x > 659 && this.dragObj.x < 820) {
        this.peremeschenie(5, x5);
      }
      //placeholder-6
      if (this.dragObj.x > 819 && this.dragObj.x < 980) {
        this.peremeschenie(6, x6);
      }
      //placeholder-7
      if (this.dragObj.x > 979) {
        this.peremeschenie(7, x7);
      }
    }
    //this.dragObj.scale = 1;
  },

  //метод миграции карт между массивами
  peremeschenie(pl_out, xx) {
    //pl_out - массив, в который переносим
    //pl - массив, из которого переносим
    var obj; //карта(обьект) - на которую кладем
    var pl = this.dragObj.pl;
    eval("obj = this.deck" + pl_out + "[this.deck" + pl_out + ".length - 1]");
    //Если цвета не совпадают или кладем на плейсхолдер
    if (obj.color != this.dragObj.color || obj.name == "placeholder_14") {
      //если вес меньше на 1
      if (this.dragObj.weight == obj.weight - 1) {
        //запоминаем текущую расстановку карт для метода UNDO
        allow_undo = true;
        this.undo.push(Object.assign(this.o, this.dragObj));
        this.undo[this.undo.length - 1].pl_out = pl_out;
        this.undo[this.undo.length - 1].plc = eval("this.deck" + pl + "[0].plc");
        //**********
        eval("this.deck" + pl_out + "[0].plo+=1"); //плюсуем счетчик открытых карт
        this.dragObj.x = xx;
        this.dragObj.y = eval("this.deck" + pl_out + "[this.deck" + pl_out + ".length-1].sy") + y_shift;
        this.dragObj.depth = eval("this.deck" + pl_out + "[this.deck" + pl_out + ".length-1].sd + 1");

        //запоминаем стартовые координаты
        this.dragObj.sx = this.dragObj.x;
        this.dragObj.sy = this.dragObj.y;

        //код ниже тянет пачку
        //если захватил больше одной карты
        var l = eval("this.deck" + pl_out + ".length"); //запоминаем позицию перемещения карты, за которую тянем до начала цикла
        if (this.upcard > 0) {
          for (let i = 1; i < this.upcard + 1; i++) /*цикл по картам сверху*/ {
            //todo **************** */
            //! Проблемы с глубиной и проблемы с перемещением на ace плейсхолдеры !!!
            //Визуальный перенос
            eval("this.deck" + pl + "[this.dragObj.sd + i].x = xx");
            eval("this.deck" + pl + "[this.dragObj.sd + i].y = this.dragObj.y + y_shift*i");
            eval("this.deck" + pl + "[this.dragObj.sd + i].sx = xx");
            eval("this.deck" + pl + "[this.dragObj.sd + i].sy = this.dragObj.y + y_shift*i");
            eval("this.deck" + pl + "[this.dragObj.sd + i].depth = this.dragObj.depth + i");
            eval("this.deck" + pl + "[this.dragObj.sd + i].sd = this.dragObj.depth + i");
          }
          //Логический перенос
          for (let i = 1; i < this.upcard + 1; i++) /*цикл по картам сверху*/ {
            eval("this.deck" + pl_out + "[0].plo += 1"); //плюсуем счетчик открытых карт
            //eval("this.deck" + this.dragObj.pl + "[this.dragObj.sd + i].scale = 1");

            let temp = l + this.upcard + 1 - i;
            eval("this.deck" + pl_out + "[temp] = this.deck" + pl + ".pop()"); //perenos mejdu massivami
            //eval("this.deck" + pl_out + "[temp].depth = this.deck" + pl_out + ".length - i");
            eval("this.deck" + pl + "[0].plo -= 1 "); //minusuem schetchik otkrytyj kart
            eval("this.deck" + pl_out + "[temp].pl = pl_out");
          }
          // this.dragObj.depth = l;
          eval("this.deck" + pl_out + "[l] = this.deck" + pl + ".pop()"); //perenos mejdu massivami
          eval("this.deck" + pl + "[0].plo -= 1"); //minusuem schetchik otkrytyj kart
          this.dragObj.pl = pl_out;
        } else {
          //Логический перенос основной карты
          // this.dragObj.depth = l;
          eval("this.deck" + pl_out + ".push(this.deck" + pl + ".pop())"); //perenos mejdu massivami
          eval("this.deck" + pl + "[0].plo -= 1"); //minusuem schetchik otkrytyj kart
          this.dragObj.pl = pl_out;
        }
        //открываем карту - убираем рубашку, если она есть, из placeholdera из которого взяли карту
        if (eval("this.deck" + pl + "[0].plc > 0")) {
          if (eval("this.deck" + pl + "[0].plo") == 0) {
            eval("this.deck" + pl + "[0].plo += 1"); //vozvrashaem nazad schetchik, potomu chto otkryli rubashku
            eval("this.deck" + pl + "[0].plc -= 1");
            eval("this.deck" + pl + "[this.deck" + pl + ".length - 1].setInteractive()");
            this.remove_shirt(pl);
          }
        }
        this.dragObj.sd = this.dragObj.depth;
        //! -- konec peremeschenija
      } else {
        this.dragObj.x = this.dragObj.sx;
        this.dragObj.y = this.dragObj.sy;
        this.dragObj.depth = this.dragObj.sd;
        //kod nizhe tianet pachku
        if (this.upcard > 0) {
          for (let i = 1; i < this.upcard + 1; i++) /*цикл po kartam sverhu*/ {
            eval("this.deck" + pl + "[this.dragObj.sd + i].x = this.dragObj.sx");
            eval("this.deck" + pl + "[this.dragObj.sd + i].y = this.dragObj.sy + y_shift*i");
            eval("this.deck" + pl + "[this.dragObj.sd + i].depth = this.dragObj.sd");
          }
        }
      }
    } else {
      this.dragObj.x = this.dragObj.sx;
      this.dragObj.y = this.dragObj.sy;
      this.dragObj.depth = this.dragObj.sd;
      //kod nizhe tianet pachku
      if (this.upcard > 0) {
        for (let i = 1; i < this.upcard + 1; i++) /*цикл po kartam sverhu*/ {
          eval("this.deck" + pl + "[this.dragObj.sd + i].x = this.dragObj.sx");
          eval("this.deck" + pl + "[this.dragObj.sd + i].y = this.dragObj.sy + y_shift*i");
          eval("this.deck" + pl + "[this.dragObj.sd + i].depth = this.dragObj.sd");
        }
      }
    }
  },
  //migration on final pl_out(ace)
  finalmove(pl_out, xx) {
    var obj;
    var pl = this.dragObj.pl;
    eval("obj = this.deck" + pl_out + "[this.deck" + pl_out + ".length - 1]");
    if (obj.suit == this.dragObj.suit || obj.name == "placeholder") {
      //esli ves bolshe na 1
      if (obj.weight == this.dragObj.weight - 1) {
        allow_undo = false; //запрет UNDO
        eval("this.deck" + pl_out + "[0].plo +=1");
        this.dragObj.x = xx;
        this.dragObj.y = y1;
        this.dragObj.depth = eval("this.deck" + pl_out + "[this.deck" + pl_out + ".length - 1].depth + 1");
        //запоминаем стартовые координаты
        this.dragObj.sx = this.dragObj.x;
        this.dragObj.sy = this.dragObj.y;
        this.dragObj.sd = this.dragObj.depth;
        //Perenos
        eval("this.dragObj.depth = this.deck" + pl_out + ".length");
        eval("this.deck" + pl_out + ".push(this.deck" + pl + ".pop())"); //perenos mejdu massivami
        eval("this.deck" + pl + "[0].plo -=1"); //minusuem schetchik otkrytyj kart
        this.dragObj.pl = pl_out;
        //открываем карту - убираем рубашку, если она есть, из placeholdera из которого взяли карту
        if (eval("this.deck" + pl + "[0].plc > 0")) {
          if (eval("this.deck" + pl + "[0].plo") == 0) {
            eval("this.deck" + pl + "[0].plo +=1"); //vozvrashaem nazad schetchik, potomu chto otkryli rubashku
            eval("this.deck" + pl + "[0].plc -=1");
            eval("this.deck" + pl + "[this.deck" + pl + ".length - 1].setInteractive()");
            this.remove_shirt(pl);
          }
        }
        //! -- konec peremeschenija
      } else {
        this.dragObj.x = this.dragObj.sx;
        this.dragObj.y = this.dragObj.sy;
        this.dragObj.depth = this.dragObj.sd;
      }
    } else {
      this.dragObj.x = this.dragObj.sx;
      this.dragObj.y = this.dragObj.sy;
      this.dragObj.depth = this.dragObj.sd;
    }
  },
  //Метод отмены хода
  undo_move() {
    allow_undo = false;

    //Визуальный перенос основной карты
    console.log(this.undo[this.undo.length - 1].sx);
    eval("this.deck" + this.undo[this.undo.length - 1].pl_out + "[this.deck" + this.undo[this.undo.length - 1].pl_out + ".length - 1].x = this.undo[this.undo.length - 1].sx");
    eval("this.deck" + this.undo[this.undo.length - 1].pl_out + "[this.deck" + this.undo[this.undo.length - 1].pl_out + ".length - 1].y = this.undo[this.undo.length - 1].sy");
    eval("this.deck" + this.undo[this.undo.length - 1].pl_out + "[this.deck" + this.undo[this.undo.length - 1].pl_out + ".length - 1].depth = this.undo[this.undo.length - 1].sd");

    //Логический перенос основной карты
    eval("this.deck" + this.undo[this.undo.length - 1].pl + ".push(this.deck" + this.undo[this.undo.length - 1].pl_out + ".pop())"); //perenos mejdu massivami
    eval("this.deck" + this.undo[this.undo.length - 1].pl + "[this.deck" + this.undo[this.undo.length - 1].pl + ".length - 1].sx = this.undo[this.undo.length - 1].sx");
    eval("this.deck" + this.undo[this.undo.length - 1].pl + "[this.deck" + this.undo[this.undo.length - 1].pl + ".length - 1].sy = this.undo[this.undo.length - 1].sy");
    eval("this.deck" + this.undo[this.undo.length - 1].pl + "[this.deck" + this.undo[this.undo.length - 1].pl + ".length - 1].sd = this.undo[this.undo.length - 1].sd");
    eval("this.deck" + this.undo[this.undo.length - 1].pl + "[this.deck" + this.undo[this.undo.length - 1].pl + ".length - 1].pl = this.undo[this.undo.length - 1].pl");

    //возвращаем рубашку на место если она там была
    if (this.undo[this.undo.length - 1].plc > 0) {
      this.shirt[last_shirt].visible = true;
      //возвращаем счетчик закрытых карт в исходное состояние
      console.log("PLC1 - " + eval("this.deck" + this.undo[this.undo.length - 1].pl + "[0].plc"));
      eval("this.deck" + this.undo[this.undo.length - 1].pl + "[0].plc += 1");
      console.log("PLC2 - " + eval("this.deck" + this.undo[this.undo.length - 1].pl + "[0].plc"));
    } else {
      //возвращаем счетчики открытых карт в исходное состояние
      eval("this.deck" + this.undo[this.undo.length - 1].pl + "[0].plo += 1");
    }
    eval("this.deck" + this.undo[this.undo.length - 1].pl_out + "[0].plo -= 1");
  },
  //Метод удаления рубашки
  remove_shirt(pos) {
    //placeholder - 2
    if (pos == 2) {
      last_shirt = 1;
      this.shirt[1].visible = false;
    }
    //placeholder - 3
    if (pos == 3) {
      if (eval("this.deck" + pos + ".length == 3")) {
        last_shirt = 3;
        this.shirt[3].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 2")) {
        last_shirt = 2;
        this.shirt[2].visible = false;
      }
    }
    //placeholder - 4
    if (pos == 4) {
      if (eval("this.deck" + pos + ".length == 4")) {
        last_shirt = 6;
        this.shirt[6].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 3")) {
        last_shirt = 5;
        this.shirt[5].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 2")) {
        last_shirt = 4;
        this.shirt[4].visible = false;
      }
    }
    //placeholder - 5
    if (pos == 5) {
      if (eval("this.deck" + pos + ".length == 5")) {
        last_shirt = 10;
        this.shirt[10].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 4")) {
        last_shirt = 9;
        this.shirt[9].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 3")) {
        last_shirt = 8;
        this.shirt[8].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 2")) {
        last_shirt = 7;
        this.shirt[7].visible = false;
      }
    }
    //placeholder - 6
    if (pos == 6) {
      if (eval("this.deck" + pos + ".length == 6")) {
        last_shirt = 15;
        this.shirt[15].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 5")) {
        last_shirt = 14;
        this.shirt[14].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 4")) {
        last_shirt = 13;
        this.shirt[13].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 3")) {
        last_shirt = 12;
        this.shirt[12].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 2")) {
        last_shirt = 11;
        this.shirt[11].visible = false;
      }
    }
    //placeholder - 7
    if (pos == 7) {
      if (eval("this.deck" + pos + ".length == 7")) {
        last_shirt = 21;
        this.shirt[21].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 6")) {
        last_shirt = 20;
        this.shirt[20].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 5")) {
        last_shirt = 19;
        this.shirt[19].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 4")) {
        last_shirt = 18;
        this.shirt[18].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 3")) {
        last_shirt = 17;
        this.shirt[17].visible = false;
      }
      if (eval("this.deck" + pos + ".length == 2")) {
        last_shirt = 16;
        this.shirt[16].visible = false;
      }
    }
  },
  //metod of first card load
  first_load() {
    var k = 1;
    var posx = x1;
    var posy = y2;
    var j;
    var name;
    //Кнопка Отмена хода
    this.add.image(undo_x, undo_y, "undo");

    //vykladka rubashki
    this.shirt.push(this.add.sprite(x1, y1, "card_shirt", "card_shirt"));
    this.shirt[0].depth = 1; //setDepth(1);
    this.shirt[0].sd = 1;
    this.shirt[0].sx = x1;
    this.shirt[0].sy = y1;
    this.shirt[0].name = "shirt";
    this.shirt[0].setInteractive();
    for (let i = 1; i <= 7; i++) {
      posy = y2;
      j = 1;
      eval("this.deck" + i + "[0] = this.add.sprite(posx, posy, 'placeholder', 'placeholder_14')");
      eval("this.deck" + i + "[0].plo = 0");
      eval("this.deck" + i + "[0].plc = 0");
      eval("this.deck" + i + "[0].weight = 14");
      eval("this.deck" + i + "[0].sy = y2 - y_shift");
      eval("this.deck" + i + "[0].sd = 0");

      do {
        eval("this.deck" + i + "[0].plo +=1");
        name = this.crd[this.crd.length - 1]; //zapominaem nazvanie kart vyhodiashih iz kolody v igru
        eval("this.deck" + i + "[j] = this.add.sprite(posx, posy, 'cards', this.crd.pop())"); //! .pop() zabiraet kartu iz kolody
        eval("this.deck" + i + "[j].name = name"); //imia karty
        eval("this.deck" + i + "[j].color = red_or_black(name)");
        eval("this.deck" + i + "[j].suit = take_suit(name)");
        eval("this.deck" + i + "[j].weight = weight(name)");
        eval("this.deck" + i + "[j].pl = i");
        eval("this.deck" + i + "[j].sx = posx");
        eval("this.deck" + i + "[j].sy = posy");
        eval("this.deck" + i + "[j].depth = j");
        eval("this.deck" + i + "[j].sd = j");
        //eval("this.deck" + i + "[j].depth = 1");
        if (i == j) eval("this.deck" + i + "[j].setInteractive()");
        else {
          eval("this.deck" + i + "[0].plo -= 1");
          eval("this.deck" + i + "[0].plc += 1");
          this.shirt[k] = this.add.sprite(posx, posy, "card_shirt", "card_shirt"); //vykladka rubashek
          this.shirt[k].depth = j;
          k++; //index rubashek
        }
        j++;
        posy = posy + y_shift / 2;
      } while (j < i + 1);
      posx = posx + 160;
    }
    this.deck8[0] = this.add.sprite(x4, y1, "placeholder", "placeholder_15");
    this.deck8[0].name = "placeholder";
    this.deck8[0].weight = 0;
    this.deck8[0].plo = 0;
    this.deck9[0] = this.add.sprite(x5, y1, "placeholder", "placeholder_15");
    this.deck9[0].weight = 0;
    this.deck9[0].plo = 0;
    this.deck9[0].name = "placeholder";
    this.deck10[0] = this.add.sprite(x6, y1, "placeholder", "placeholder_15");
    this.deck10[0].weight = 0;
    this.deck10[0].plo = 0;
    this.deck10[0].name = "placeholder";
    this.deck11[0] = this.add.sprite(x7, y1, "placeholder", "placeholder_15");
    this.deck11[0].weight = 0;
    this.deck11[0].plo = 0;
    this.deck11[0].name = "placeholder";
    //Nachalo
    this.deck12[0] = this.add.sprite(x1, y1, "placeholder", "placeholder_16");
    this.deck12[0].name = "placeholder";
    this.deck12[0].sd = 0;
    this.deck12[0].sx = x1;
    this.deck12[0].sy = y1;
    this.deck12[0].setInteractive();
    this.deck0[0] = this.add.sprite(x2, y1, "placeholder", "placeholder_14");
    this.deck0[0].name = "placeholder";
    this.deck0[0].plo = 0;
  },
});

var config = {
  type: Phaser.AUTO,
  parent: "content",
  width: 1280,
  height: 720,
  backgroundColor: "#007700",
  zoom: 1,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 400 },
    },
  },
  scene: [BootScene, WorldScene],
};

var game = new Phaser.Game(config);
