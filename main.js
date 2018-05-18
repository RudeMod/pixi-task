//Список ресурсов для ячеек
let symbolsSRC = [
	"imgs/magic_forest_bonfire.png",
	"imgs/magic_forest_bow.png",
	"imgs/magic_forest_leaf.png",
	"imgs/magic_forest_rope.png",
	"imgs/magic_forest_tent.png",
];
//Координаты ячеек
let fieldsPosition = [[214, 1366], [552, 1366], [889, 1366], [214, 1703], [552, 1703], [889, 1703]];

let charRed;

//Создаем Canvas приложения и добавляем его в body
let app = new PIXI.Application(1097, 1920);
document.body.appendChild(app.view);

//Загружаем базовые ресурсы
PIXI.loader
.add('charRed', 'imgs/red/red.json')
.add(symbolsSRC)
.add([
	"imgs/magic_forest_bg.jpg",
	"imgs/magic_forest_winner_frame.png",
	"imgs/magic_forest_frame_for_text.png",
	"imgs/magic_forest_frame.png",
	"imgs/magic_forest_win_up_to_100.png",
	"imgs/magic_forest_scratch_frame.png",
	"imgs/magic_forest_scratch_frame_big.png",
	"imgs/magic_forest_frame2.png",
	"imgs/magic_forest_button.png",
	"imgs/magic_forest_question_icon.png",
	"imgs/magic_forest_coin_icon_big.png",
	"imgs/magic_forest_frame1.png",
])
.load(setup);

//Базовая отрисовка после загрузки ресурсов 
//loader и res получаем с PIXI.loader
function setup(loader, res) {
	drawGame();
	createRed(loader, res);
	drawStartScreen();
}

//Укороченая версия получения загруженый ресурсов
function loadRes(link) {
	return PIXI.loader.resources[link].texture;
}

let gameGroup; //Основной игровой контейнер

function drawGame() {
	//Устанавливаем фон
	let bg = new PIXI.Sprite( loadRes("imgs/magic_forest_bg.jpg") );
	// bg.name = 'background';
	bg.x += -152;
	app.stage.addChild(bg);
	
	//Описание выигрыша
	let titleTextSprite = new PIXI.Sprite( loadRes("imgs/magic_forest_win_up_to_100.png") );
	titleTextSprite.name = 'titleTextSprite';
	titleTextSprite.position.set(159, 40);
	app.stage.addChild(titleTextSprite);

	//Фон бонусной ячейки
	let bonusBG = new PIXI.Sprite( loadRes("imgs/magic_forest_winner_frame.png") );
	bonusBG.name = 'bonusBG';
	bonusBG.position.set(526, 140);
	app.stage.addChild(bonusBG);

	//Фон для зоны описания (над ячейками)
	let descriptionBG = new PIXI.Sprite( loadRes("imgs/magic_forest_frame_for_text.png") );
	descriptionBG.name = 'descriptionBG';
	descriptionBG.position.set(56, 1043);
	descriptionBG.scale.set(0.98, 1);
	app.stage.addChild(descriptionBG);

	//Стираемый спрайт для бонусной ячейки
	let hideLayer = new PIXI.Sprite( loadRes('imgs/magic_forest_scratch_frame_big.png') );
	hideLayer.name = 'bonusHideLayer';
	hideLayer.position.set(799, 553);
	hideLayer.anchor.set(0.5);
	app.stage.addChild(hideLayer);

	//Стираемые спрайты на обычные ячейки
	let hideLayerTexture = loadRes("imgs/magic_forest_scratch_frame.png");
	fieldsPosition.forEach((pos, i) => {
		let hideLayer = new PIXI.Sprite( hideLayerTexture );
		hideLayer.name = 'hideLayer'+i;
		hideLayer.position.set(pos[0], pos[1]);
		hideLayer.anchor.set(0.5);
		app.stage.addChild(hideLayer);
	});

	//Основной игровой контейнер
	gameGroup = new PIXI.Container();
	gameGroup.name = 'gameGroup';
	app.stage.addChild(gameGroup);
}

//Создание и установка анимации персонажа
function createRed(loader, res) {
	//Загружаем персонажа
	charRed = new PIXI.spine.Spine(res.charRed.spineData);
	charRed.skeleton.setToSetupPose();
	charRed.update(0);
	//Будем обновлять автоматически, 
	//так как оригинальная анимация слишком быстрая
	charRed.autoUpdate = false;
	
	let charCage = new PIXI.Container();
	charCage.addChild(charRed);
	
	//Распологаем персонажа в контейнере по центру
	let localRect = charRed.getLocalBounds();
	charRed.position.set(-localRect.x, -localRect.y);
	
	app.stage.addChild(charCage);

	charCage.position.set(80, 280);
	charRed.state.setAnimation(0, 'red_idle_loop', true)

	//Запускаем обработку анимации
	app.ticker.add(animRed);
}

let redLastFrame = 0;
function animRed() {
	let nowFrame = performance.now();
	//Для плавной анимации используем разницу между 
	//новым и последним кадром
	let frameTime = (nowFrame - redLastFrame)/1000;
	redLastFrame = nowFrame;
	charRed.update(frameTime);
}

let darkness;
let startBarGroup, winBarGroup;
//Момент запуска анимации. Используется как окном старта, так и финала.
let startTimeAnimation;
let coinWinText;
function drawStartScreen() {
	//Перекрывающий фон для стартового и финального окна
	darkness = new PIXI.Graphics();
	darkness.alpha = 0.5;
	darkness.beginFill(0x000000);
	darkness.drawRect(0, 0, app.screen.width, app.screen.height);
	app.stage.addChild(darkness);

	//Контейнер стартового окна
	startBarGroup = new PIXI.Container();
	startBarGroup.name = 'startBarGroup';
	startBarGroup.position.set(0, 1525);
	app.stage.addChild(startBarGroup);

	//Фон для описаний и кнопки стартового окра
	let startBarBG = new PIXI.Sprite( loadRes('imgs/magic_forest_frame2.png') );
	startBarBG.name = 'startBarBG';
	startBarBG.position.set(0, 0);
	startBarGroup.addChild(startBarBG);

	//Кнопка старта
	let startButton = new PIXI.Sprite( loadRes('imgs/magic_forest_button.png') );
	startButton.name = 'startButton';
	startButton.position.set(27, 191);
	startButton.interactive = true;
	startButton.buttonMode = true;
	startBarGroup.addChild(startButton);

	//Событие скрытия стартового блока и запуска раунда
	startButton.on('touchend', pointerUp);
	startButton.on('mouseup', pointerUp);
	function pointerUp(event) {
		startButton.interactive = false;
		//Присваевам стартовой точке анимации текущее время жизни DOM
		startTimeAnimation = performance.now();
		app.ticker.add(startGameAnimation);
		while (gameGroup.children[0]) { //Очищаем от прошлого раунда
			gameGroup.children[0].destroy();
		}
		startGame();
	}
	
	//Стиль текста кнопки старта
	let startButtonTextStyle = new PIXI.TextStyle({
		fontFamily: "DRAguSansBlack",
		fontSize: 72,
		fill: "#ffffff",
	});
	//текст кнопки старта
	let startButtonText = new PIXI.Text("Play for 60", startButtonTextStyle);
	startButtonText.name = 'startButtonText';
	startButtonText.position.set(371, 238);
	startBarGroup.addChild(startButtonText);
	
	//Иконка кнопки старта
	let coinIcon = new PIXI.Sprite( loadRes('imgs/magic_forest_coin_icon_big.png') );
	coinIcon.name = 'coinIcon';
	coinIcon.scale.set(0.6);
	coinIcon.position.set(726, 253);
	startBarGroup.addChild(coinIcon);

	//How To Play стиль
	let howToPlayTextStyle = new PIXI.TextStyle({
		fontFamily: "DRAguSansBlack",
		fontSize: 72,
		fill: "#ff8729"
	});
	//How To Play текст
	let howToPlayText = new PIXI.Text("How To Play", howToPlayTextStyle);
	howToPlayText.name = 'howToPlayText';
	howToPlayText.position.set(440, 60);
	startBarGroup.addChild(howToPlayText);
	
	//Иконка для How To Play
	let helpIcon = new PIXI.Sprite( loadRes('imgs/magic_forest_question_icon.png') );
	helpIcon.name = 'helpIcon';
	helpIcon.position.set(330, 63);
	startBarGroup.addChild(helpIcon);

	//Группа для финальной победы
	winBarGroup = new PIXI.Container();
	winBarGroup.name = 'winBarGroup';
	winBarGroup.visible = false;
	winBarGroup.position.set(47, 220);
	app.stage.addChild(winBarGroup);

	//Задник для текста выигрыша
	let finishBarBG = new PIXI.Sprite( loadRes('imgs/magic_forest_frame1.png') );
	finishBarBG.name = 'finishBarBG';
	finishBarBG.position.set(0, 0);
	winBarGroup.addChild(finishBarBG);

	//Стиль победы
	let youWonTextStyle = new PIXI.TextStyle({
		fontFamily: "DRAguSansBlack",
		fontSize: 116,
		fill: "#f45b4e"
	});
	//Текст победы
	let youWonText = new PIXI.Text("YOU WIN", youWonTextStyle);
	youWonText.name = 'youWonText';
	youWonText.position.set(300, 30);
	winBarGroup.addChild(youWonText);

	let coinWinTextStyle = new PIXI.TextStyle({
		fontFamily: "DRAguSansBlack",
		fontSize: 126,
		fill: "#311d1f"
	});
	//Число выигрыша. Заполняется в событии финала
	coinWinText = new PIXI.Text('', coinWinTextStyle);
	coinWinText.name = 'coinWinText';
	coinWinText.position.set(550, 136);
	coinWinText.anchor.set(1, 0);
	winBarGroup.addChild(coinWinText);

	//Иконка для текста выигрыша
	let winCoinIcon = new PIXI.Sprite( loadRes('imgs/magic_forest_coin_icon_big.png') );
	winCoinIcon.name = 'winCoinIcon';
	winCoinIcon.position.set(570, 160);
	winBarGroup.addChild(winCoinIcon);
}

//Анимация скрытия стартовой группы и исчезновения темного фона
function startGameAnimation() {
	//По итогу анимация должна закончиться через 0.5 секунды
	let progress = ((performance.now()) - startTimeAnimation)/1000 * 2;

	if (progress >= 1) {
		progress = 1;
		//Удаляем функцию анимации
		app.ticker.remove(startGameAnimation);
	} 

	darkness.alpha = (1-progress) * 0.5;
	winBarGroup.y = 220 - 560*progress;
	startBarGroup.y = 1525 + 400*progress;

}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

let isWin;  //bool победы
let winSymbol; //Требуемый символ
let winCoin;    //Итоговый выигрыш
let symbolList; //Символы основного поля
let openCount;  //Количество открытых ячеек
let currentAnimation = 'idle'; //Текущая анимация

function startGame(loader, res) {
	symbolList = [];
	openCount = 0;
	winSymbol = -1;
	winCoin = 25;
	//Определяем символ выигрыша с шансом согласно ТЗ
	let random = Math.round(Math.random()*100);
	switch(true) {
		case (random < 2):
			winSymbol = 4;
			winCoin += 100;
			break;
			
		case (random < 6):
			winSymbol = 3;
			winCoin += 50;
			break;
			
		case (random < 12):
			winSymbol = 2;
			winCoin += 35;
			break;
			
		case (random < 20):
			winSymbol = 1;
			winCoin += 30;
			break;
			
		case (random < 30):
			winCoin += 25;
			winSymbol = 0;
	}

	//Если выигрыш
	if (winSymbol > -1) {
		isWin = true;
		//Гарантированные выигрышные символы
		symbolList[0] = symbolList[1] = symbolList[2] = winSymbol;
		
		//Добавляем остальные символы исключая выигрышные
		for(let i=3; i<6; i++) {
			let nextSymbol;
			do {
				nextSymbol = randomInt(0, 4);
			} while(nextSymbol == winSymbol)
			symbolList.push(nextSymbol);
		}

		//Перемешиваем символы
		symbolList.forEach((symbol, ind) => {
			let changeInd;
			do {
				changeInd = randomInt(0, 4);
			} while(changeInd == ind)
			symbolList[ind] = symbolList[changeInd];
			symbolList[changeInd] = symbol;
		});

	}
	else { //Если проигрыш
		isWin = false;
		winSymbol = randomInt(0, 4);
		let winCount = 0; //Количество победных символов
		//Генерируем символы так, чтобы победных было не более двух
		for(let i=0; i<6; i++) {
			let symbol;
			do {
				symbol = randomInt(0, 4);
			} while(symbol == winSymbol && winCount == 2)
			if (symbol == winSymbol) ++winCount;
			symbolList.push(symbol);
		}
	}

	createRendererMask();
	drawDescription();
	drawSymbols();
	drawBonusSymbol();

	//Добавляем перекрытый слов в игровую группу
	gameGroup.addChild(rendererMask);
}

let rendererMask;
let dragging = false; //переключатель активации стирания
function createRendererMask() {
	//Слой покрывающий всю область приложения
	let renderTexture = PIXI.RenderTexture.create(app.screen.width, app.screen.height);
	let renderTextureSprite = new PIXI.Sprite(renderTexture);
	gameGroup.addChild(renderTextureSprite);

	//Текстура, которая закрывается renderTextureSprite
	//Будет хранить в себе символы игрового и бонусного полей
	rendererMask = new PIXI.Sprite();
	rendererMask.mask = renderTextureSprite;

	gameGroup.interactive = true;
	gameGroup.on('touchstart', pointerOver);
	gameGroup.on('touchend', pointerOut);
	gameGroup.on('touchmove', (event)=>{
		pointerMove(event);
		//Волнение запускается всегда когда игрок водит по экрану
		if (currentAnimation == 'idle') {
			currentAnimation = 'worry';
			charRed.state.setAnimation(0, 'red_worry_st', false)
			charRed.state.addAnimation(0, 'red_worry_loop', true, 0);
		}
	});

	gameGroup.on('pointerover', pointerOver);
	gameGroup.on('pointerout', pointerOut);
	gameGroup.on('pointermove', pointerMove);

	//"Кисть" для стирания перекрывающего слоя
	let brush = new PIXI.Graphics();
	brush.beginFill(0xffffff);
	brush.drawCircle(0, 0, 50);
	brush.endFill();

	function pointerMove(event) {
		if (dragging) {
			//Стираем перекрывающий слой по позиции "кисти"
			brush.position.copy(event.data.global);
			app.renderer.render(brush, renderTexture, false, null, false);
		}
	}

	function pointerOver(event) {
		dragging = true;
		pointerMove(event);
	}

	function pointerOut(event) {
		dragging = false;
		//Если игрок водил по экрану - переключаем анимацию обратно
		if (currentAnimation == 'worry') {
			currentAnimation = 'idle';
			charRed.state.setAnimation(0, 'red_worry_end', false)
			charRed.state.addAnimation(0, 'red_idle_loop', true, 0);
		}
	}
}

//Распологаем цель раунда
function drawDescription() {
	//Контейнер описания цели
	let desxriptionGroup = new PIXI.Container();
	desxriptionGroup.name = 'desxriptionGroup';
	desxriptionGroup.position.set(88, 1071);
	gameGroup.addChild(desxriptionGroup);

	//Распологаем основной текст
	let msgDescriptionStyle = new PIXI.TextStyle({
		fontFamily: "DRAguSansBlack",
		fontSize: 52,
		fill: "#f45b4e",
	});
	let msgDescription1 = new PIXI.Text("MATCH THE WINNER", msgDescriptionStyle);
	msgDescription1.name = 'msgDescription1';
	msgDescription1.position.set(1, 0);
	desxriptionGroup.addChild(msgDescription1);
	let msgDescription2 = new PIXI.Text("AND WIN A PRIZE!", msgDescriptionStyle);
	msgDescription2.name = 'msgDescription2';
	msgDescription2.position.set(543, 0);
	desxriptionGroup.addChild(msgDescription2);

	//Необходимый для победы символ
	let msgDescriptionImg = new PIXI.Sprite( loadRes(symbolsSRC[winSymbol]) );
	msgDescriptionImg.name = 'msgDescriptionImg';
	msgDescriptionImg.position.set(453, -10);
	msgDescriptionImg.scale.set(0.3);
	desxriptionGroup.addChild(msgDescriptionImg);
}

//Единичный запуск требуемой анимации. Позвле завершения происходит возврат
//к анимации покоя
function singleAnimation(key) {
	currentAnimation = key;
	charRed.state.setAnimation(0, key+'_st', false)
	charRed.state.addAnimation(0, key+'_loop', false, 0);
	charRed.state.addAnimation(0, key+'_end', false, 0);
	charRed.state.addAnimation(0, 'red_idle_loop', true, 0);
	setTimeout(()=>{
		currentAnimation = 'idle';
	}, 2000);
}

//Расположение символов в основной зоне
function drawSymbols() {
	let filedBGTexture = loadRes("imgs/magic_forest_frame.png");
	//Последовательно работаем с каждой ячейкой
	symbolList.forEach((symbolID, i) => {
		//Фон ячейки
		let filedBG = new PIXI.Sprite( filedBGTexture );
		filedBG.name = 'filedBG'+i;
		filedBG.position.set(fieldsPosition[i][0], fieldsPosition[i][1]);
		filedBG.anchor.set(0.5);

		//Символ ячейки
		let symbol = new PIXI.Sprite( loadRes(symbolsSRC[symbolID]) );
		symbol.name = 'symbol'+i;
		symbol.position.set(fieldsPosition[i][0], fieldsPosition[i][1]);
		symbol.anchor.set(0.5);

		//Добавляем фон и ячейку в перекрытый слой
		rendererMask.addChild(filedBG, symbol)

		//Зона, где реагируют события для ячейки
		let graphics = new PIXI.Graphics();
		graphics.alpha = 0;
		graphics.beginFill(0x000000);
		graphics.drawRect(fieldsPosition[i][0] - 140, fieldsPosition[i][1] - 140, 280, 280);
		gameGroup.addChild(graphics);

		//Определяем зону ячейки
		let startPointX = fieldsPosition[i][0] - 140;
		let startPointY = fieldsPosition[i][1] - 140;

		let minPos, maxPos;
		graphics.interactive = true;

		//Выигрышна ли ячейка?
		let isWinSymbol = symbolID == winSymbol;

		let touchmove = (event) => {
			//Позиция курсора
			let pos = event.data.global;
			//Если мы вне зоны ячейки - отменяем обработку
			if (pos.x < startPointX || pos.x > startPointX+280
				|| pos.y < startPointY || pos.y > startPointY+280
			) {
				return;
			}

			//minPos и maxPos - минимально и максимально посещенные позиции.
			if (!minPos) {
				minPos = { x: event.data.global.x, y: event.data.global.y };
				maxPos = { x: event.data.global.x, y: event.data.global.y };
			}
			//Если посетили позицию меньше минимальной - переписываем minPos.
			//далее аналогично
			if (pos.x < minPos.x) minPos.x = pos.x;
			if (pos.x > maxPos.x) maxPos.x = pos.x;
			if (pos.y < minPos.y) minPos.y = pos.y;
			if (pos.y > maxPos.y) maxPos.y = pos.y;
			/* Определяем диагональ между минимальными и максимальными позициями 
			   по х и у по теореме Пифагора */
			let length = Math.pow(Math.pow((minPos.x - maxPos.x), 2) + Math.pow((minPos.y - maxPos.y), 2), 0.5);
			//Если получили длинну диагонали - открываем ячейку
			if (length >= 280) {
				drag = false;

				//Добавляем ранее преекрытые фон и ячейку в основную группу
				gameGroup.addChild(filedBG, symbol)
				graphics.destroy();

				if (isWinSymbol)
					singleAnimation('red_happy_card');
				else
					singleAnimation('red_disappointed');

				//Если открыты все ячейки - завершаем игру
				if(++openCount == 7) finishGame();
			}
		}
		
	    graphics.on('touchmove', touchmove);
	    graphics.on('pointermove', touchmove);

		graphics.on('pointerover', ()=>{
			charRed.state.setAnimation(0, 'red_worry_st', false)
			charRed.state.addAnimation(0, 'red_worry_loop', true, 0);
		});
	    graphics.on('pointerout',  ()=>{
			charRed.state.setAnimation(0, 'red_worry_end', false)
			charRed.state.addAnimation(0, 'red_idle_loop', true, 0);
		});
	});
}

function drawBonusSymbol() {
	//Фон бонусной ячейки
	let bonusBG = new PIXI.Sprite( loadRes("imgs/magic_forest_winner_frame.png") );
	bonusBG.name = 'bonusBG';
	bonusBG.position.set(526, 140);

	//Символ бонусной чейки
	let symbol = new PIXI.Sprite( loadRes(symbolsSRC[winSymbol]) );
	symbol.name = 'bonusSymbol';
	symbol.position.set(800, 590);
	symbol.anchor.set(0.5);

	//Добавляем фон и ячейку в перекрытый слой
	rendererMask.addChild(bonusBG, symbol)

	//Зона, где реагируют события для ячейки
	let graphics = new PIXI.Graphics();
	graphics.alpha = 0;
	graphics.beginFill(0x000000);
	graphics.drawRect(614, 367, 368, 368);
	gameGroup.addChild(graphics);

	let minPos, maxPos;
	graphics.interactive = true;

	let touchmove = (event) => {
		//Позиция курсора
		let pos = event.data.global;
		//Если мы вне зоны ячейки - отменяем обработку
		if (pos.x < 614 || pos.x > 614+368
			|| pos.y < 367 || pos.y > 367+368
		) {
			return;
		}
		
		//minPos и maxPos - минимально и максимально посещенные позиции.
		if (!minPos) {
			minPos = { x: event.data.global.x, y: event.data.global.y };
			maxPos = { x: event.data.global.x, y: event.data.global.y };
		}
		//Если посетили позицию меньше минимальной - переписываем minPos.
		//далее аналогично
		if (pos.x < minPos.x) minPos.x = pos.x;
		if (pos.x > maxPos.x) maxPos.x = pos.x;
		if (pos.y < minPos.y) minPos.y = pos.y;
		if (pos.y > maxPos.y) maxPos.y = pos.y;
		
		/* Определяем диагональ между минимальными и максимальными позициями 
		   по х и у по теореме Пифагора */
		let length = Math.pow(Math.pow((minPos.x - maxPos.x), 2) + Math.pow((minPos.y - maxPos.y), 2), 0.5);
		//Если получили длинну диагонали - открываем ячейку
		if (length >= 440) {
			drag = false;
			//Добавляем ранее преекрытые фон и ячейку в основную группу
			gameGroup.addChild(bonusBG, symbol)
			graphics.destroy();
			singleAnimation('red_happy_bonus');

			//Если открыты все ячейки - завершаем игру
			if(++openCount == 7) finishGame();
		}
	};

	graphics.on('touchmove', touchmove);
	graphics.on('pointermove', touchmove);

	graphics.on('pointerover', ()=>{
		charRed.state.setAnimation(0, 'red_worry_st', false)
		charRed.state.addAnimation(0, 'red_worry_loop', true, 0);
	});
	graphics.on('pointerout',  ()=>{
		charRed.state.setAnimation(0, 'red_worry_end', false)
		charRed.state.addAnimation(0, 'red_idle_loop', true, 0);
	});
}

function finishGame() {
	//Возвращаем кнопку старта в "тыкабельное" состояние
	startBarGroup.getChildByName('startButton').interactive = true;

	//Отображаем фрейм с суммой выигрыша
	winBarGroup.visible = true;
	coinWinText.text = ''+winCoin;

	//Присваевам стартовой точке анимации текущее время жизни DOM
	startTimeAnimation = performance.now();
	app.ticker.add(finishGameAnimation);
}

function finishGameAnimation() {
	//По итогу анимация должна закончиться через 0.5 секунды
	let progress = (performance.now() - startTimeAnimation)/1000 * 2;

	if (progress >= 1) {
		progress = 1;
		//Удаляем функцию анимации
		app.ticker.remove(finishGameAnimation);
	}

	darkness.alpha = progress * 0.5;
	winBarGroup.y = 220 - 560*(1-progress);
	startBarGroup.y = 1525 + 400*(1-progress);
}
