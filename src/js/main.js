/**
 * Приложение "Router".
 * Демонстрирует работу с API Яндекс.Карт.
 * 
 * @author Alexander Rezukov (2018) <inf@ranweb.ru>
 * @version 1.0
 */
(function (ymaps) {
	//=include includes.js - Подключаем классы.
	
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