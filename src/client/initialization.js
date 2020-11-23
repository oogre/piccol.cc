
import {docReady, submitInit} from "./tools.js";

docReady(()=>{
	document.querySelector("form input[type=hidden]").value = location.pathname.substring(1);
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
		event => submitInit(event).then(()=>location.reload()), 
		false
	);
});