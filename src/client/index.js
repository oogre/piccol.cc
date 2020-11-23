
import {docReady, listBoard} from "./tools.js";

docReady(async ()=>{
	['submit']
	.forEach(eventName => {
		document.querySelector("form")
		.addEventListener(
			eventName, 
			event => {
				event.preventDefault()
				event.stopPropagation()
			}, 
			false
		);
	});
	document.querySelector("form")
	.addEventListener(
		"submit", 
		event => location = event.target.boardName.value, 
		false
	);

	const boardList = await listBoard();
	boardList.map(boardName => {
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.href=boardName;
		a.innerText=boardName;
		li.appendChild(a);
		document.querySelector("ul#boardList").appendChild(li);
	});

})
		