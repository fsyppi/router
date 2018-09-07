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
