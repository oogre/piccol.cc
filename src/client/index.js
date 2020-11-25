
import {docReady, listBoard} from "./tools.js";

docReady(async ()=>{
	['submit']
	.forEach(eventName => {
		[...document.querySelectorAll("form")]
		.map(form=>{
			form.addEventListener(
				eventName, 
				event => {
					event.preventDefault()
					event.stopPropagation()
				}, 
				false
			);	
		})
	});
	document.querySelector("form#createBoard")
	.addEventListener(
		"submit", 
		event => location = encodeURIComponent(event.target.boardName.value), 
		false
	);
	document.querySelector("form#filterBoards input[type=text]")
	.addEventListener(
		"input", 
		({target}) => {
			let {value} = target;
			value = value.toLowerCase();
			[...document.querySelectorAll("form#filterBoards li")]
			.map(item => {
				const name = item.querySelector("a").innerText.toLowerCase();
				if(name.includes(value)){
					item.classList.remove("hide");	
				}else{
					item.classList.add("hide");	
				}
			})
		}, 
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
		