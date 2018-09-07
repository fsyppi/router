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
