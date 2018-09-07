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
