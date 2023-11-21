// 放在文件最上方 ---> 狀態機
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

//  rootElement.innerHTML = Array.from(Array(52).keys());

// //如果先創一個arr rootElement也可以改成下列
// let arr = [];
// for (let i = 0; i <= 51; i++) {
//   arr.push(i);
// }
// rootElement.innerHTML = arr.map((index) => this.getCardElement(index)).join("");

const view = {
  //未翻牌-->顯示背面
  getCardElement(index) {
    return `<div class="card back" data-index ="${index}"></div>`;
  },
  //翻開-->顯示內容
  getCardContent(index) {
    //index 從 0 開始 --> card number是1~13
    const number = this.transformNumber((index % 13) + 1);
    const symbols = Symbols[Math.floor(index / 13)];
    return `
        <p data-number="${number}">${number}</p>
        <img
          src="${symbols}"
        />
        <p>${number}</p>
      `;
  },
  //Card展示內容 --->因狀態機修改 indexes
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  transformNumber(number) {
    //當參數符合case, return case value
    //都不符合 --> return default value
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  //click牌
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        //翻成正面-->顯示card內容
        card.classList.remove("back");
        return (card.innerHTML = this.getCardContent(
          Number(card.dataset.index)
        ));
      } else {
        //翻回背面
        card.classList.add("back");
        card.innerHTML = null;
      }
    });
  },

  pairedCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  // pairedCards(card) {
  //   for (key of card) {
  //     key.classList.add("paired");
  //   }
  // },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score : ${score} `;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried : ${times} times`;
  },

  //添加動畫 --> 添加wrong, event:動畫結束 移除wrong
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        { once: true }
      );
    });
  },

  //遊戲結束
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index >= 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

// 運用遊戲狀態來控制遊戲流程
// 和資料有關的程式碼歸類在 model 裡
// 和視覺有關的程式碼歸類在 view 裡
// 由 controller 統一調度動作

const model = {
  revealedCards: [],
  //兩項number是否匹配
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  score: 0,

  triedTimes: 0,
};

//要將global的 method fn 統一改由controller 設定fn控制
const controller = {
  //預設狀態
  currentState: GAME_STATE.FirstCardAwaits,

  //生成卡片 -->
  //原本global  執行 view.displayCards() -->
  //改由controller 內的 generateCards()控制 執行
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  //(點擊卡片)依照不同的遊戲狀態,做不同的行為
  //!!case完 記得 + break or return
  dispatchCardAction(card) {
    //已翻開的-->不執行
    if (!card.classList.contains("back")) return;
    //翻牌, 將翻開的牌存入model已翻開arr, 改state
    switch (this.currentState) {
      //翻第一張牌
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      //翻第二張牌
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        view.renderTriedTimes(model.triedTimes++);
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //配對正確 --> 留著 變色顯示, 清空revealed, 改state
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          //要對一張以上執行 要+...
          view.pairedCards(...model.revealedCards);
          // view.pairCard(model.revealedCards[0]);
          // view.pairCard(model.revealedCards[1]);
          model.revealedCards = [];
          //達到分數, 遊戲結束
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished(); // 加在這裡
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //配對失敗 --> 延遲1秒 翻回來, 清空revealed, 改state
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
          // view.flipCard(model.revealedCards[0]);
          // view.flipCard(model.revealedCards[1]);
        }
        break;
    }

    // console.log("currentState : ", this.currentState);
    // console.log("revealCard : ", model.revealedCards);
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};
// view.flipCard(card);
controller.generateCards();

//Node List
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    // console.log(card);
    controller.dispatchCardAction(card);
  });
});
