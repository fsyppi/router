/**
 * Приложение "Router".
 * Демонстрирует работу с API Яндекс.Карт.
 * 
 * @author Alexander Rezukov (2018) <inf@ranweb.ru>
 * @version 1.0
 */
(function (ymaps) {
	/**
	 * Класс Publisher регистрирует подписчиков и оповещает их о наступлении событий.
	 * 
	 * @class
	 * @constructor
	 */
	function Publisher() {
		/**
		 * Список подписчиков.
		 * 
		 * @property handlers
		 * @type Object
		 */
		this.handlers = {};
	}
	
	/**
	 * Регистрирует метод класса в списке подписчиков.
	 * 
	 * @method on
	 * @param {string} type - Тип события.
	 * @param {function} callback - Метод класса.
	 * @memberof Publisher.prototype
	 */
	Publisher.prototype.on = function (type, callback) {
		if (!this.handlers[type]) {
			this.handlers[type] = []; 
		}
	
		this.handlers[type].push(callback);
	};
	
	/**
	 * Оповещает о наступлении события.
	 * 
	 * @method emit
	 * @param {string} type - Тип события.
	 * @param {any} args - Передаваемые параметры.
	 * @memberof Publisher.prototype
	 * @return {any} - Результат вызова метода или undefined.
	 */
	Publisher.prototype.emit = function (type, ...args) {
		/**
		 * Результат вызова метода класса-подписчика (если необходим). 
		 */
		let result;
		
		if (this.handlers[type]) {
			this.handlers[type].forEach((element) => {
				result = element(...args);
			});
			
			return result;
		}
	};
	
	/**
	 * Класс Search. Наследует от Publisher. 
	 * Устанавливает обработчик на текстовое поле ввода.
	 * 
	 * @class
	 * @constructor
	 * @param {string} idSearch - Идентификатор тега.
	 * @augments Publisher
	 */
	function Search(idSearch) {
		/** 
		 * Вызываем конструктор родительского класса. 
		 */
		Publisher.apply(this);
	
		this.elemSearch = document.getElementById(idSearch);
		this.elemSearch.addEventListener("keyup", (event) => this.handler(event));
	}
	
	/** Наследует прототип Publisher. */
	Search.prototype = Object.create(Publisher.prototype);
	Search.prototype.constructor = Search;
	
	/**
	 * Обработчик события "keyup". При нажатии "Enter" генерирует событие "submit". Очищает поле ввода.
	 * 
	 * @method handler
	 * @param {object} event - Объект события.
	 * @memberof Search.prototype
	 */
	Search.prototype.handler = function (event) {
		if (event.keyCode === 13) {
			let target = event.target;
	
			if (target.value !== "") {
				this.emit("submit", target.value);
				target.value = "";
			}
		}
	};
	
	/**
	 * Класс Map. Наследует от Publisher.
	 * Работа с Яндекс-картой.
	 * 
	 * @class
	 * @constructor
	 * @param {object} ymaps - Ссылка на карту.
	 * @param {string} container - id тега.
	 * @param {object} options - Опции.
	 * @param {array}  options.center - Координаты центра.
	 * @param {number} options.zoom - Масштабирование.
	 * @param {string} options.type - Вид.
	 * @augments Publisher
	 */
	function Map(ymaps, container, options) {
		/** 
		 * Вызываем конструктор родительского класса. 
		 */
		Publisher.apply(this);
	
		this.ymaps = ymaps;
		
		/** 
		 * Создаём карту, коллекцию для точек и отдельную коллекцию для линии. 
		 */
		this.map = new ymaps.Map(container, options);
		this.pointsCollection = this.createCollectionPoints();
		this.linesCollection = this.createCollectionLines();
		
		/**
		 * Здесь же создадим и добавим линию в коллекцию линий.
		 */
		this.createLine();
	}
	
	/** Наследует прототип Publisher. */
	Map.prototype = Object.create(Publisher.prototype);
	Map.prototype.constructor = Map;
	
	/**
	 * Обработчик буксировки точек.
	 * 
	 * @method dragHandler
	 * @param {obect} event - Объект события.
	 * @memberof Map.prototype
	 */
	Map.prototype.dragHandler = function (event) {
		/**
		 * Получаем точку, индекс точки в коллекции и координаты.
		 */
		let obj = event.get("target"),
			index = this.pointsCollection.indexOf(obj),
			coordinates = obj.geometry.getCoordinates();
	
		/**
		 * Изменяем геометрию линии.
		 */
		this.linesCollection.get(0).geometry.set(index, coordinates);
	};
	
	/**
	 * Создаёт коллекцию для точек.
	 * 
	 * @method createCollectionPoints
	 * @memberof Map.prototype
	 * @return {object} - Коллекция точек. 
	 */
	Map.prototype.createCollectionPoints = function () {
		let pointsCollection = new this.ymaps.GeoObjectCollection();
	
		/**
		 * Ставим обработчик на "drag", добавляем коллекцию точек в геообъекты карты.
		 */
		pointsCollection.events.add("drag", this.dragHandler, this);
		this.map.geoObjects.add(pointsCollection);
	
		return pointsCollection;
	};
	
	/**
	 * Создаёт точку, добавляет в коллекцию точек, "возбуждает" событие "add".
	 * 
	 * @method createPoint
	 * @param {array} coordinates - Координаты точки. 
	 * @param {string} pointName - Название точки.
	 * @memberof Map.prototype
	 */
	Map.prototype.createPoint = function (coordinates, pointName) {
		let point = new this.ymaps.GeoObject(
			{
				geometry: {
					type: "Point",
					coordinates: coordinates
				},
				properties: {
					iconContent: pointName,
					balloonContent: pointName
				}
			},
			{
				draggable: true,
				preset: 'islands#violetStretchyIcon'
			}
		);
	
		/**
		 * Добавим в коллекцию.
		 */
		this.pointsCollection.add(point);
	
		/**
		 * "Возбуждаем" событие "add".
		 */
		this.emit("add", point.properties.get("iconContent"));
	};
	
	/**
	 * Создаёт коллекцию для линии.
	 * 
	 * @method createCollectionLines
	 * @memberof Map.prototype
	 * @return {object} - Коллекция линии. 
	 */
	Map.prototype.createCollectionLines = function () {
		let linesCollection = new ymaps.GeoObjectCollection();
		
		/**
		 * Коллекцию размещаем в геообъектах карты.
		 */
		this.map.geoObjects.add(linesCollection);
		
		return linesCollection;
	};
	
	/**
	 * Создаёт линию без координат вершин и добавляет в коллекцию.
	 * 
	 * @method createLine
	 * @memberof Map.prototype
	 */
	Map.prototype.createLine = function () {
		let lineString = new this.ymaps.GeoObject(
			{
				geometry: {
					type: "LineString",
					coordinates: []
				}
			},
			{
				strokeColor: "#FF0000",
				strokeWidth: 3
			}
		);
	
		/**
		 * Добавим в коллекцию.
		 */
		this.linesCollection.add(lineString);
	};
	
	/**
	 * Вставляет новую точку (вершину) в линию.
	 * 
	 * @method insertPointIntoLine
	 * @memberof Map.prototype
	 */ 
	Map.prototype.insertPointIntoLine = function () {
		let index = this.pointsCollection.getLength() - 1,
			coordinates = this.pointsCollection.get(index).geometry.getCoordinates();
			
			this.linesCollection.get(0).geometry.insert(index, coordinates);
	};
	
	/**
	 * Создаёт точку в коллекции, вставляет вершину (точку) в линию.
	 * 
	 * @method newPoint
	 * @param {string} pointName - Название точки.
	 * @memberof Map.prototype
	 */
	Map.prototype.newPoint = function (pointName) {
		/**
		 * Геокодирование (координаты точки по названию).
		 */
		let geocode = this.ymaps.geocode(pointName);
		
		geocode.then((res) => {
				let obj = res.geoObjects.get(0),
					coordinates;
	
				/**
				 * Получаем координаты точки или центра.
				 */
				if (obj) {
					coordinates = obj.geometry.getCoordinates();
				} else {
					coordinates = this.map.getCenter()
				}
	
				/**
				 * Центрируем по координатам.
				 * Создаём точку.
				 * Вставляем точку в линию.
				 */
				this.map.setCenter(coordinates);
				this.createPoint(coordinates, pointName);
				this.insertPointIntoLine();
			},
			function (err) {
				console.log('Ошибка');
			}
		)
	};
	
	/**
	 * Удаляет точку (вершину) у линии и из коллекции точек.
	 * 
	 * @method removePoint
	 * @param {number} index - Индекс точки.
	 * @memberof Map.prototype
	 */
	Map.prototype.removePoint = function (index) {
		this.linesCollection.get(0).geometry.remove(index);
		this.pointsCollection.remove(this.pointsCollection.get(index));
	};
	
	/**
	 * Меняет порядок двух точек в коллекции и у линии.
	 * 
	 * @method exchange
	 * @param {number} indexFirstPoint - Индекс первой точки. 
	 * @param {number} indexSecondPoint - Индекс второй точки.
	 * @memberof Map.prototype
	 */
	Map.prototype.exchange = function (indexFirstPoint, indexSecondPoint) {
		/**
		 * Получаем точки по индексам.
		 */
		let firstPoint = this.pointsCollection.get(indexFirstPoint),
			secondPoint = this.pointsCollection.get(indexSecondPoint);
		
		/**
		 * Меняем точки местами в коллекции точек.
		 */
		this.pointsCollection.add(firstPoint, indexSecondPoint);
		this.pointsCollection.add(secondPoint, indexFirstPoint);
	
		/**
		 * Меняем точки местами у линии.
		 */
		this.linesCollection.get(0).geometry.splice(indexFirstPoint, 1, secondPoint.geometry.getCoordinates());
		this.linesCollection.get(0).geometry.splice(indexSecondPoint, 1, firstPoint.geometry.getCoordinates());
	};
	
	/**
	 * Класс List. Наследует от Publisher. Манипулирует элементами представляющими точки на карте.
	 * @class
	 * @constructor
	 * @param {object} elem - ID тега.
	 * @augments Publisher
	 */
	function List(elem) {
		/** 
		 * Вызываем конструктор родительского класса. 
		 */
		Publisher.apply(this);
	
		/** 
		 * Получаем указатель на список. 
		 */
		this.list = document.getElementById(elem),
	
		/**
		 * Установим обработчик на "click".
		 */
		this.list.addEventListener("click", (event) => this.remove(event));
	};
	
	/**
	 * Наследует прототип Publisher.
	 */
	List.prototype = Object.create(Publisher.prototype);
	List.prototype.constructor = List;
	
	/**
	 * Добавляет элемент в список.
	 * 
	 * @method add
	 * @param {string} pointName - Имя точки.
	 * @memberof List.prototype
	 */
	List.prototype.add = function (pointName) {
		let elem = document.createElement("li");
	
		elem.innerHTML = pointName + "<a class=\"button\"></a>";
		this.list.appendChild(elem);
	};
	
	/**
	 * Удаляет элемент из списка. Генерирует событие "remove".
	 * 
	 * @method remove
	 * @param {object} event - Объект события.
	 * @memberof List.prototype
	 */
	List.prototype.remove = function (event) {
		if (event.target.classList.contains("button")) {
			let elem = event.target.parentNode;
	
			this.emit("remove", this.getIndex(elem));
			this.list.removeChild(elem);
		}
	};
	
	/**
	 * Возвращает индекс элемента в списке.
	 * 
	 * @method getIndex
	 * @param {object} elem - Элемент.
	 * @memberof List.prototype
	 * @return {number} - Индекс элемента.
	 */
	List.prototype.getIndex = function (elem) {
		let nextElem = elem.nextSibling,
			count = 1;
	
		while (nextElem) {
			nextElem = nextElem.nextSibling;
			count++;
		};
		
		return this.list.childNodes.length - count;
	};
	
	/**
	 * Генератор события "exchange". Сообщает о том, что произошёл обмен позиций двух элементов.
	 * 
	 * @method change
	 * @param {number} indexFirstElem - Индекс первого элемента.
	 * @param {number} indexSecondElem - Индекс второго элемента.
	 * @memberof List.prototype
	 */
	List.prototype.change = function (indexFirstElem, indexSecondElem) {
		this.emit("exchange", this.getIndex(indexFirstElem), this.getIndex(indexSecondElem));
	};
	
	/**
	 * Класс DragForce. Наследует от Publisher. Позволяет изменить позицию элемента в списке.
	 * 
	 * @class
	 * @constructor
	 * @param {object} elem - ID тега.
	 * @augments Publisher
	 */
	function DragForce(list) {
		/** 
		 * Вызываем конструктор родительского класса. 
		 */
		Publisher.apply(this);
		
		/** 
		 * Получаем указатель на список. 
		 */
		this.list = document.getElementById(list);
	
		/**
		 * Регистрируем обработчики.
		 */
		this.list.addEventListener("mousedown", (event) => this.mouseDown(event));
		this.list.addEventListener("mouseup",   (event) => this.mouseUp(event));
		
		this.list.addEventListener("dragstart", (event) => this.dragStart(event));
		this.list.addEventListener("dragenter", (event) => this.dragEnter(event));
		this.list.addEventListener("dragover",  (event) => this.dragOver(event));
		this.list.addEventListener("dragleave", (event) => this.dragLeave(event));
		this.list.addEventListener("drop",      (event) => this.drop(event));
		this.list.addEventListener("dragend",   (event) => this.dragEnd(event));
	}
	
	/**
	 * Наследует прототип Publisher.
	 */
	DragForce.prototype = Object.create(Publisher.prototype);
	DragForce.prototype.constructor = DragForce;
	
	/**
	 * Обработчик "mousedown".
	 * 
	 * @method mouseDown
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.mouseDown = function (event) {
		/** 
		 * Работаем только с левой кнопкой мыши и элементами родителя this.list. 
		 * Делаем элемент буксируемым.
		 */
		if (event.which === 1 && event.target.parentNode === this.list) {
			event.target.draggable = true;
			event.target.classList.toggle("draggable");
		}
	};
	
	/**
	 * Обработчик "mouseup". Удаляет атрибуты элемента.
	 * 
	 * @method mouseUp
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.mouseUp = function (event) {
		this.removeAttr(event.target);
	};
	
	/**
	 * Обработчик "dragstart". Начало буксировки объекта.
	 * 
	 * @method dragStart
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.dragStart = function (event) {
		let target = event.target;
		
		/**
		 * Если родитель не this.list, прекращаем обработку.
		 */
		if (target.parentNode !== this.list) {
			event.preventDefault();
			return;
		};
	
		let data = event.dataTransfer;
		
		/**
		 * Данные буксировки.
		 */
		data.setData("Text", target.innerHTML);
		data.effectAllowed = "copyMove";
	};
	
	/**
	 * Обработчик "dragenter". Буксируемый объект оказался над приёмником.
	 * 
	 * @method dragEnter
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.dragEnter = function (event) {
		/**
		 * Если родитель приёмника this.list и отсутствует атрибут "draggable", делаем элемент приёмником.
		 */
		if (event.target.parentNode === this.list && !event.target.draggable) {
			event.target.classList.toggle("dropzone");
			event.preventDefault();
		}
	};
	
	/**
	 * Обработчик "dragover". Буксировка над приёмником продолжается.
	 * 
	 * @method dragOver
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.dragOver = function (event) {
		/**
		 * Если родитель приёмника this.list и отсутствует атрибут "draggable", подтверждаем готовность принять объект.
		 */
		if (event.target.parentNode === this.list && !event.target.draggable) {
			event.preventDefault();
		}
	};
	
	/**
	 * Обработчик "dragleave". Буксируемый объект покидает границы приёмника.
	 * 
	 * @method dragLeave
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.dragLeave = function (event) {
		/**
		 * Если родитель приёмника this.list и отсутствует атрибут "draggable", удаляем атрибуты приёмника.
		 */
		if (event.target.parentNode === this.list && !event.target.draggable) {
			event.target.removeAttribute("class");
		}
	};
	
	/**
	 * Обработчик "drop". Сбрасывает объект буксировки. Производит обмен данными источника и приёмника буксировки.
	 * 
	 * @method drop
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.drop = function (event) {
		let target = event.target,
			sourceElem = document.getElementsByClassName("draggable")[0];
		
		event.preventDefault();
		
		/**
		 * Удаляем класс приёмника.
		 */
		target.removeAttribute("class");
	
		/**
		 * Производим обмен данными источника и приёмника буксировки.
		 */
		sourceElem.innerHTML = target.innerHTML;
		target.innerHTML = event.dataTransfer.getData("Text");
	
		/**
		 * Сообщаем подписчикам об изменении.
		 */
		this.emit("change", sourceElem, target);
	};
	
	/**
	 * Обработчик "dragEnd". Буксировка завершена.
	 * 
	 * @method dragEnd
	 * @param {object} event - Объект события.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.dragEnd = function (event) {
		/**
		 * Удаляем атрибуты источника.
		 */
		this.removeAttr(event.target);
	};
	
	/**
	 * Удаляет атрибуты.
	 * 
	 * @method removeAttr
	 * @param {object} elem - Элемент.
	 * @memberof DragForce.prototype
	 */
	DragForce.prototype.removeAttr = function (elem) {
		if (elem.parentNode === this.list) {
			elem.removeAttribute("draggable");
			elem.removeAttribute("class");
		}
	};
	
	
	/**
	 * Создаёт карту, элемент поиска, список точек. На список точек устанавливаем инструмет Drag and Drop (DragForce).
	 * Подписывает слушателей на события.
	 *  
	 * @method init
	 */
	function init() {
		let map = new Map(
				ymaps, 
				"map", 
				{
					center: [51.66082, 39.200404],
					zoom: 5,
					type: "yandex#hybrid"
				}
			),
			search = new Search("search-point"),
			list = new List("list-points"),
			dragForce = new DragForce("list-points");

		/**
		 * Подписка.
		 * 
		 * Событие "add" - добавленна точка на карту.
		 * Событие "submit" - нажали клавишу Enter.
		 * Событие "remove" - удалён элемент из списка точек.
	 	 * Событие "exchange" - сообщает о изменение позиции элемента списка.
	 	 * Событие "change" - произошёл обмен позиций элементов списка.
		 */
		map.on("add", list.add.bind(list));
		search.on("submit", map.newPoint.bind(map));
		list.on("remove", map.removePoint.bind(map));
		list.on("exchange", map.exchange.bind(map));
		dragForce.on("change", list.change.bind(list));
	}
	
	/** ... */
	ymaps.ready(init);

}(ymaps))