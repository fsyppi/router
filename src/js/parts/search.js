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
