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
