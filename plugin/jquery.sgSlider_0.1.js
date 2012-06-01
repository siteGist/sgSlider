(function($) {
	$.fn.imagesLoaded = function(callback){
	  var elems = this.filter('img'),
		  len   = elems.length,
		  blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
		  
	  elems.bind('load.imgloaded',function(){
		  if (--len <= 0 && this.src !== blank){ 
			elems.unbind('load.imgloaded');
			callback.call(elems,this); 
		  }
	  }).each(function(){
		 // cached images don't fire load sometimes, so we reset src.
		 if (this.complete || this.complete === undefined){
			var src = this.src;
			// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			// data uri bypasses webkit log warning (thx doug jones)
			this.src = blank;
			this.src = src;
		 }  
	  }); 

	  return this;
	};
	$.fn.sgSlider = function(params){
		var ob = { // ТИПОВІ НАЛАШТУВАННЯ
			/** Опції розмітки **/
			// Чи генеруємо ХТМЛ?
				buildHTML: false,
			// Якщо '' тоді всі дочірні елементи стануть одиницями слайдера, інакше будуть обрані ел. конкретного класу
				wrapSelector: '',
			// Назва класів для обгортки каркасу ХТМЛ структури слайдера, це більш необхідно коли каркас будується динамічно
				carcass: {
					container: 'container',
					wrapper: 'wrapper',
					itemHolder: 'item-holder',
					item: 'item'
				},
			// Налаштування кнопочок
				navigation: {
					use: true,
					classNext: 'next',
					classPrev: 'previous',
					text: {
						prev: '‹',
						next: '›'
					},
					bind: 'click'
				},
		/** Налаштування режиму **/
				vertical: false,
			// Чи прокручувати в зворотню сторону
				reverse: false,
			// Безперервна прокрутка - тут більше можливостей
				carousell: {
					enable:	false,
				// Прокрутка в одну сторону
					oneDirection: false
				},
		/** Налаштування додаткових величин **/
			// Крок для зміщення, у пікселях, по кількості ел. та по повній ширині контейнера - 'N(px)', (int)'N', 'full'
				step: 'full',
			// Вирівнювання поточного елементу, якщо такий з'явиться - 'left' = 'top, 'center', 'right' = 'bottom'
				align: 'center',
			// Стартова позиція у пікселях або за номером поточного елементу - N(px), (int)N
				startPosition: '0px',
			// При наведенні на елемент робити його поточним через певний час
				currOnHover: {
					enable: false,
					timeout: 500
				},
			// При проведенні мишкою над обмежувачем будемо прокручувати контейнер
				scrollOnHover: {
					enable: false,
				// Повертатись до поточного ел. якщо він є
					returnToCurrent: true,
				// Час анімації повернення
					returnToCurrentTimeout: 1000,
				// Розмір відступу відносно першого та ост. ел. у відсотковому відношенні, для того щоб не впиратись в сам край слайдера
					sizeIndent: 0.5,
				// Максимальний прижок у відсотковому відношенні відносно розміру контейнера
					maxJump: 0.1,
				// Час анімації до позиції, якщо перевищено "maxJump", поставте 0 якщо не треба
					// зроблено для того щоб не було різкого прижка до поточної позиції
					offsetAnimateTime: 500
				},
			// Чи запскати анімацію по її завершенню?
				animateWhenShowEnds: false,
			// Час анімації прокрутки, відповідно й можна изначити щвидкість якщо ще встановити крок...
				speed: 1200,
			// Еффекти "ізінгу"
				easing: 'linear',
			// Перевірка чи всі зображення завантажено
				// checkImgLoaded: true,
			// налаштування автопрокрутки
				autoNext: {
					enable: false,
					way: null,	// можливість зробити "карту" прокрутки слайдера: [+N,N,-N,...], null
								// N: Npx, (int)N; 
									// +/-N - додати до/відняти від величини,
									// N - конкретна величина
								// null: в цьому випадку наступний крок буде в розмірі величини параметру o.step
					repeat: true, // повтори: true, false, (int)N
					timeout: 3475,
					delay: { // delay options if action under was triggerd in a plugin.
						multiply: 3, // multiply of wait time
						onAction: 'anext aprev' // default action to make delay
					}
				},
		/** Функції відгуку **/
			// При старті
				onStart: function() {},
			// При визначенні поточного ел., obj jQuery об'єкт пот. ел.
				onCurr: function(obj) {},
			// При початку анімації прокрутки
				onAniStart: function() {},
			// При кінці анімації прокрутки
				onAniEnd: function() {},
		/** Службові методи **/
			init: function() {}
		};
		$.extend(true, ob, params ); // Розширюємо типове з нетиповим
		var mainClass = { // - зберігаємо класи для обгортки каркасу
			container: 'sgSlider-container ',
			wrapper: 'sgSlider-wrapper ',
			itemHolder: 'sgSlider-itemHolder ',
			item: 'sgSlider-item '
		};
		var Return;
		this.each(function() {
			var $this = $(this);
			var sgSliderFn = function(){
				var o = $.extend(true, {}, ob); // Розширюємо типове з нетиповим
				{ // Перемінні та підготовка слайдеру
					
					/*
					 'segmentSize' - ширина/висота сегменту(якщо карусель контейнер множитсья на 5 сегментів), для прокрутки
					 'crossSize' - висота/ширина, для встановлення відображення максимального поперчечного розміру
					 'fullSize' - у випдаку каруселі рівне 5-ьом 'segmentSize', інакше просто рівне 'segmentSize'
					 'startPos' - Стартова позиція контейнеру
					 'autoNext' - variable for autoNext function
					 'inEnd' - if in ends it will gets 'aPrev' or 'aNext' values, else is null
					 
					 'animating' - чи в поточний час відбуваєтсья анімація, для опції "o.animateWhenShowEnds"
					 'stepMode' - режим прокрутки у пікселях, або приіндексації елементів
					 'current' - ініціалізація буде при: встановленні кроку як поелементно, і/тільки при роботі фокусу на елемент
					*/
					var crossSize = 0;
					var segmentSize = 0;
					var fullSize = 0;
					var startPos = 0;
					var autoNext = {
						interval: null,
						pos: 0,
						repeated: 0,
						delayTime: null,
						reverse: false
					};
					var inEnd = null;
					
					var animating = false;
					var stepMode = (o.step=='full' || o.step.toString().search('px') != -1)?'px':'num';
					var current = {
						num: null,
						numContainer: 'items',
						px: null
					};
						
					// var carousell;
					
					
					if(o.buildHTML) { // Підготовка розмітки
						// додяємо кореневий клас
						$this.addClass(mainClass.container+o.carcass.container)
						// опрацьовуємо кожний слайд, також надаємо їм клас
						.children(o.wrapSelector).addClass(mainClass.item+o.carcass.item)
						.each(function(index){ $(this).addClass('item-'+index); })
						// обгортаємо контейнером та "врапером"
						.wrapAll('<div class="'+mainClass.wrapper+o.carcass.wrapper+'" >'
						+'<div class="'+mainClass.itemHolder+o.carcass.itemHolder+'" />'+'</div>');
					} else {
						$this.addClass(mainClass.container+o.carcass.container)
						.children().eq(0).addClass(mainClass.wrapper+o.carcass.wrapper)	// було children('div')
						.children().addClass(mainClass.itemHolder+o.carcass.itemHolder)	// було children('div, ul, ol')
						.children().addClass(mainClass.item+o.carcass.item+' ')			// було children('div, li')
						.each(function(index){ $(this).addClass('item-'+index); });
					}
					
					var $wrapper	= $this.children('.'+mainClass.wrapper).eq(0);
						var $itemHolder	= $wrapper.children('.'+mainClass.itemHolder).eq(0);
							var $items		= $itemHolder.children('.'+mainClass.item);
							var $lowItems, $lowLowItems, $highItems, $highHighItems;
							var quantity = $items.length-1;
						var holderSize = function() { return (!o.vertical)?$itemHolder.width():$itemHolder.height(); };
					var wrapperSize = function() { return (!o.vertical)?$wrapper.width():$wrapper.height(); };
					var carousell = {
						enable: ( holderSize() < wrapperSize() )? false :o.carousell.enable
					};
					
					if(o.navigation.use) { // Додаєм навігацію
						if (carousell.enable && o.carousell.oneDirection && o.reverse || !o.carousell.oneDirection || !carousell.enable)
							$this.prepend('<a href="" class="navi '+o.navigation.classPrev+'">'+o.navigation.text.prev+'</a>');
						if (carousell.enable && o.carousell.oneDirection && !o.reverse || !o.carousell.oneDirection || !carousell.enable)
							$this.append('<a href="" class="navi '+o.navigation.classNext+'">'+o.navigation.text.next+'</a>');
					}
					
					$items.each(function() { // визначаємо ширну та висоту "Холдера" ел.
						if(!o.vertical) {
							segmentSize = segmentSize + $(this).width()/*  + o.itemsSpacing */;
							crossSize = ($(this).height()>crossSize)?$(this).height():crossSize;
						} else {
							segmentSize = segmentSize + $(this).height()/*  + o.itemsSpacing */;
							crossSize = ($(this).width()>crossSize)?$(this).width():crossSize;
						}
					});
					fullSize = segmentSize; // це якщо не карусель, оскільки семент один
					if(carousell.enable) { // Робимо зміни у випадку каруселі
						// Будемо мати 5 сегментів, нам необхідно показати повністю прокрутку від початку відрізку до кінця й навпаки
						$itemHolder
							.prepend('<div class="lowLowSide"></div><div class="lowSide"></div>')
							.append('<div class="highSide"></div><div class="highHighSide"></div>');
						$items.clone().prependTo($itemHolder.children('div.lowLowSide'));
						$items.clone().prependTo($itemHolder.children('div.lowSide'));
						$items.clone().prependTo($itemHolder.children('div.highSide'));
						$items.clone().prependTo($itemHolder.children('div.highHighSide'));
						startPos = segmentSize*2;
						fullSize = segmentSize*5;
						
							current.px = (stepMode=='px')?o.step+startPos:null;
							
						$lowItems = $itemHolder.children('.lowSide').children('.'+mainClass.item);
						$lowLowItems = $itemHolder.children('.lowLowSide').children('.'+mainClass.item);
						$highItems = $itemHolder.children('.highSide').children('.'+mainClass.item);
						$highHighItems = $itemHolder.children('.highHighSide').children('.'+mainClass.item);
					}
					
					if(!o.vertical) { // Налаштовуємо розміри, враховуємо залежність від позиціонування
						$wrapper.css({ 'height': Math.ceil(crossSize) });
						$itemHolder.css((!o.reverse)?{
							'width': Math.ceil(fullSize),
							'height': Math.ceil(crossSize),
							'left': -startPos
						}:{
							'width': Math.ceil(fullSize),
							'height': Math.ceil(crossSize),
							'right': -startPos
						});
						$items.css({ 'height': Math.ceil(crossSize) });
					} else {
						$this.addClass('vertical');
						$wrapper.css({ 'width': Math.ceil(crossSize), 'height': '100%' });
						$itemHolder.css((!o.reverse)?{
							'height': Math.ceil(fullSize),
							'width': Math.ceil(crossSize),
							'top': -startPos
						}:{
							'height': Math.ceil(fullSize),
							'width': Math.ceil(crossSize),
							'bottom': -startPos
						});
						$items.css({ 'width': Math.ceil(crossSize) });
					}
					o.step = (o.step == 'full')?wrapperSize():(o.step.toString().search('px') != -1)?parseInt(o.step.toString().match(/\d+/gi)[0]):parseInt(o.step);
					o.startPosition = (o.startPosition.toString().search('px') != -1)?parseInt(o.startPosition.toString().match(/\d+/gi)[0]):parseInt(o.startPosition);
							
					current.px = (stepMode=='px')?o.step:null;
					current.num = (stepMode=='num')?o.step:null;
					
					if(o.reverse) $this.addClass('reverse');
				}
				{ // Внутрішні функціїї
					$this._Curr = function(num) {
						$items.removeClass('curr');
						$items.eq(num).addClass('curr');
						
						if(carousell.enable) {
							$lowItems.removeClass('curr');
							$lowItems.eq(num).addClass('curr');
							$lowLowItems.removeClass('curr');
							$lowLowItems.eq(num).addClass('curr');
							
							$highItems.removeClass('curr');
							$highItems.eq(num).addClass('curr');
							$highHighItems.removeClass('curr');
							$highHighItems.eq(num).addClass('curr');
						}
						o.onCurr($items.eq(num));
						return this;
					}
					$this._checkBttns = function() { // Перевірка доступності кнопочок, тільки не при 'carousell.enable' == true
						if( carousell.enable ) return this;
						var position = $itemHolder.position();
						var aPrev = (!o.reverse)?o.navigation.classPrev:o.navigation.classNext;
						var aNext = (!o.reverse)?o.navigation.classNext:o.navigation.classPrev;
						var pos = ( !o.vertical)?
							(!o.reverse)?
								position.left
								: wrapperSize() - position.left - holderSize()
							:(!o.reverse)?
								position.top
								: wrapperSize() - position.top - holderSize();
						if ( (-1)*pos <= 0 ) {
							$this.find('a.'+aPrev).addClass('disabled');
							inEnd = 'aPrev';
						} else {
							$this.find('a.'+aPrev).removeClass('disabled');
							inEnd = null;
						}
						if ( (-1)*pos >= holderSize() - wrapperSize() ) {
							$this.find('a.'+aNext).addClass('disabled');
							inEnd = 'aNext';
						} else {
							$this.find('a.'+aNext).removeClass('disabled');
							inEnd = null;
						}
						
						return this;
					};
					$this._goTo = function(params) { // Головна функція анімування, також тут оброблена анімація каруселі
						var params = $.extend({
							isNum: false,
							amount: NaN,
							action: 'default',
							blink: false
						}, params || {});
					// Виходимо яко вімкнена опція аніміція-тількипо-завершенню
						if(animating && o.animateWhenShowEnds) return true;
						function rightPos(value) {
							return (!o.vertical)?
								(!o.reverse)?{left:value}:{right:value}
								:(!o.reverse)?{top:value}:{bottom:value};
						}
						function numPos(number) {
							function amount($obj,num) {
								var pos = $obj.eq(num).position();
								var forAligning = 
									(o.align == 'left')?
										(!o.reverse)?
											0
											:(!o.vertical)?
												-wrapperSize()+$obj.eq(num).width()
												: -wrapperSize()+$obj.eq(num).height()
									:(o.align == 'right')?
										(!o.reverse)?
											(!o.vertical)?
												-wrapperSize()+$obj.eq(num).width()
												: -wrapperSize()+$obj.eq(num).height()
											:0
									:(o.align == 'center')?
										(!o.reverse)?
											(!o.vertical)?
												-wrapperSize()/2+$obj.eq(num).width()/2
												:-wrapperSize()/2+$obj.eq(num).height()/2
											:(!o.vertical)?
												-wrapperSize()/2+$obj.eq(num).width()/2
												:-wrapperSize()/2+$obj.eq(num).height()/2
									:0/* if o.align not valid :( */;
								return (!o.vertical)?
									(!o.reverse)?pos.left 							+forAligning
										:holderSize()-pos.left-$obj.eq(num).width()	+forAligning
									:(!o.reverse)?pos.top							+forAligning
										:holderSize()-pos.top-$obj.eq(num).height()	+forAligning;
							}
							if( !carousell.enable ) {
								$obj = $items;
							} else {
								var distance = Math.abs(amount($items,current.num)-amount($items,number));
								if( $items.length > 2 )
									$obj = ( distance <= segmentSize/2-10 )?
										$items
										:(current.num < params.amount)? $lowItems :$highItems;
								else {
									number = (number < 0)?0
										:(number == $items.length)?
											$items.length-1
											:number;
									
									$obj = (
										( current.num > number )
										&& ( params.action == 'anext' )
										)? 
											(
												!o.carousell.oneDirection
												|| o.carousell.oneDirection && !o.reverse
											)?$highItems:$lowItems
											:(
												( current.num < number )
												&& ( params.action == 'aprev' )
											)?
												(
													!o.carousell.oneDirection
												|| o.carousell.oneDirection && o.reverse
												)?$lowItems:$highItems
											:$items;
								}
							}
							return {
								ani: amount($obj,number),
								blink: amount($items,number)
							};
						}
						var blink;
						if(!params.isNum) {
							switch(carousell.enable) {
							case false:
								if(!params.isNum)
									params.amount = (params.amount <= 0)?0:(params.amount >= holderSize()-wrapperSize())?holderSize()-wrapperSize():params.amount;
								params.amount = blink = params.amount;
							break;
							case true:// Якщо карусель то ми повинні бачити хоча б частково третій сегмент
								// Перевірка чи не виходимо за межі позволеного
								if(
									(params.amount < 1.5*segmentSize)
									&& (params.amount > 0.5*segmentSize)
								) {
									blink = params.amount + segmentSize;
									break;
								} else if (params.amount < 0.5*segmentSize) {
									blink = params.amount + 2*segmentSize;
									break;
								}
								if(
									(params.amount > 3.5*segmentSize)
									&& (params.amount < 4.5*segmentSize) 
								) {
									blink = params.amount - segmentSize;
									break;
								} else if(params.amount > 4.5*segmentSize) {
									blink = params.amount - 2*segmentSize;
									break;
								}
								blink = params.amount;
								break;
							}
						} else {
							params.amount = (params.amount < 0)?
								quantity+params.amount+1
								:(params.amount > quantity)?
									params.amount%quantity-1
									:params.amount;
							var income = numPos(params.amount);
							current.num = params.amount;
							$this._Curr(current.num);
							params.amount = income.ani;
							blink = income.blink;
							if(!carousell.enable) {
								params.amount=(params.amount <= 0)?0:(params.amount >= holderSize()-wrapperSize())?holderSize()-wrapperSize():params.amount;
								blink=(blink <= 0)?0:(blink >= holderSize()-wrapperSize())?holderSize()-wrapperSize():blink;
							}
						}
						current.px = Math.abs(blink);
							o.onAniStart();
							animating = true;
							$itemHolder.stop(true,true).animate(rightPos( -Math.abs(params.amount) ),o.speed,o.easing,function(){
								$this._checkBttns();
								$itemHolder.css( rightPos( -Math.abs(blink) ) );
								animating = false;
								o.onAniEnd();
							});
					
						if(
							o.autoNext.enable && 
							( o.autoNext.delay.onAction.search(params.action) != -1 )
						) {
							clearInterval(autoNext.interval);
							clearTimeout(autoNext.delayTime);
							autoNext.delayTime = setTimeout(function(){
								$this.autoNext();
							}, (o.autoNext.delay.multiply-1)*o.autoNext.timeout );
						}
					}
					$this.autoNext = function() {
						if( o.autoNext.enable )
							if( o.autoNext.way == null ) {
								autoNext.interval = setInterval(function() {
									$this._checkBttns()
									var sign =(!o.reverse)?
										(inEnd == 'aPrev')?1:-1
										:(inEnd == 'aNext')?-1:1;
									var amount = current[(stepMode=='px')?'px':'num']+o.step*sign;
									$this._goTo({
										isNum: (stepMode=='px')?false:true,
										amount: amount,
										action: 'anext'
									});
								}, o.autoNext.timeout );
							} else if( (typeof o.autoNext.way == "object") && (o.autoNext.way instanceof Array) ) {
								var atStart = true;
								autoNext.interval = setInterval(function() {
									$this._checkBttns()
									var isNum = ( o.autoNext.way[ autoNext.pos ].toString().search('px') != -1)?
										false :true;
									
									if( current.num == null ) {
										if( isNum && (autoNext.pos==0) && atStart ) current.num = 0;
										atStart = false;
									}
									
									var adSign = ( o.autoNext.way[ autoNext.pos ].toString().search(/^\-/) != -1 )?
										-1 :( o.autoNext.way[ autoNext.pos ].toString().search(/^\+/) != -1 )?
											1 :null;
									
									var value = o.autoNext.way[ autoNext.pos ].toString().match(/\d+/g)[0];
									var amount = (adSign == null)?
										value
										:parseInt(current[(isNum)?'num':'px'])+parseInt(value)*adSign;
									
									$this._goTo({
										isNum: isNum,
										amount: amount,
										action: 'autoNext'
									});
									
									autoNext.pos++;
									if( autoNext.pos == o.autoNext.way.length ) { // do in end of a way
										autoNext.pos = 0;
										if( 
											o.autoNext.repeat-1 === autoNext.repeated ||
											o.autoNext.repeat === false
										) clearInterval(autoNext.interval); else autoNext.repeated++;
									} else { // we are one the way, again or in the first time...
									}
								}, o.autoNext.timeout );
							}
					}
				}
				{ // Обєкт -> Подія -> Функція
					$this.find('a.'+o.navigation.classNext).bind(o.navigation.bind,function(e){
						e.preventDefault();
						$this._checkBttns()
						if( !$(this).hasClass('disabled') ) { 
							var sign =(!o.reverse)?1:-1;
							$this._goTo({
								isNum: (stepMode=='px')?false:true,
								amount: current[(stepMode=='px')?'px':'num']+o.step*sign,
								action: 'anext'
							});
						}
						return false;
					});
					$this.find('a.'+o.navigation.classPrev).bind(o.navigation.bind,function(e){
						e.preventDefault();
						$this._checkBttns()
						if( !$(this).hasClass('disabled') ) {
							var sign =(!o.reverse)?1:-1;
							$this._goTo({
								isNum: (stepMode=='px')?false:true,
								amount: current[(stepMode=='px')?'px':'num']-o.step*sign,
								action: 'aprev'
							});
						}
						return false;
					});
					if(o.currOnHover.enable) { // При наведдені робимо слайд поточним
						var itemBindTimeout; $itemHolder.find('.'+mainClass.item).each(function(){
							var number = parseInt( $(this).attr('class').match(/item\-\d+/gi)[0].match(/\d+/gi) );
							$(this).bind({
								mouseover: function(){
									clearTimeout(itemBindTimeout);
									itemBindTimeout = setTimeout(function(){
										$this._goTo({
											isNum: true,
											amount: number,
											action: 'itemBind'
										});
									}, o.currOnHover.timeout);
								},
								mouseout: function() {
									clearTimeout(itemBindTimeout);
								}
							});
						});
					};
				
					if(o.scrollOnHover.enable && !carousell.enable) { // При наведдені прокручужмо контейнери
						var wrapperHoverTimeout; $wrapper.bind({
							mousemove:function(e) {
								clearTimeout(wrapperHoverTimeout);
								function rightPos(value) {
									return (!o.vertical)?
										(!o.reverse)?{left:value}:{right:value}
										:(!o.reverse)?{top:value}:{bottom:value};
								}
								var lowIndent = (!o.vertical)?
									$items.eq(0).width()*o.scrollOnHover.sizeIndent
									:$items.eq(0).height()*o.scrollOnHover.sizeIndent;
								var highIndent = (!o.vertical)?
									$items.eq($items.length-1).width()*o.scrollOnHover.sizeIndent
									:$items.eq($items.length-1).height()*o.scrollOnHover.sizeIndent;
								var pos = (!o.vertical)?
									e.pageX - $(this).offset().left - lowIndent
									:e.pageY - $(this).offset().top - lowIndent;
									
								pos = (pos <= 0)?0
									:(pos >= wrapperSize() - highIndent - lowIndent)?
										wrapperSize() - highIndent - lowIndent
										:pos;

								var wrappSize = wrapperSize()-highIndent-lowIndent;
								var slideSize = holderSize() - wrapperSize();
								pos = (!o.reverse)?
									pos/wrappSize*slideSize
									:slideSize-pos/wrappSize*slideSize;
								var holderPos = (!o.vertical)?
									(!o.reverse)?$itemHolder.css('left').match(/\d+/gi)[0]:$itemHolder.css('right').match(/\d+/gi)[0]
									:(!o.reverse)?$itemHolder.css('top').match(/\d+/gi)[0]:$itemHolder.css('bottom').match(/\d+/gi)[0];
								if( Math.abs(holderPos-pos) >= holderSize()*o.scrollOnHover.maxJump )
									$itemHolder.stop(false,false).animate(rightPos( -pos ),o.scrollOnHover.offsetAnimateTime);
								else
									$itemHolder.css(rightPos( -pos ));
								current.px = pos;
							},
							mouseleave: function() {
								if(o.scrollOnHover.returnToCurrent) wrapperHoverTimeout = setTimeout(function(){
									if( !isNaN(parseInt(current.num)) ) {
										$this._goTo({
											isNum: true,
											amount: current.num,
											action: 'returntocurr'
										});
									}
								},o.scrollOnHover.returnToCurrentTimeout);
							}
						});
					}
				}
				{ // При старті
					$this._goTo({
						isNum: (stepMode=='px')?false:true,
						amount: o.startPosition,
						action: 'start'
					});
					o.onStart();
					$this.autoNext();
					$this._checkBttns();
				}
			};
			if( $this.find('img').length == 0)
				sgSliderFn();
			else
				// Чекаємо коли завантажуться картинки... Тому варто наперед встановити стилі !!!
				$this.find('img').imagesLoaded(function(){ sgSliderFn(); });
			
			Return = $this;
		});
		if( this.length == 1) return Return; else return this;
	};
})(jQuery);