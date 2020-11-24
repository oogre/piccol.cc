
import {docReady, loadData, handleFiles, isVisible, removeFile} from "./tools.js";

const handleFilesWrapper = (files) => {
	handleFiles(files)
	.then(()=>{
		location.reload();
	});
}

docReady( async ()=>{
	document.querySelector("h3").innerText = decodeURIComponent(location.pathname.substring(1));

	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.body.addEventListener(eventName, e => {
			e.preventDefault()
			e.stopPropagation()
		}, false)
	});

	['dragenter', 'dragover']
	.forEach(eventName => {
		document.body.addEventListener(eventName, () => {
			document.body.classList.add('highlight')
		}, false)
	});

	['dragleave', 'drop']
	.forEach(eventName => {
		document.body.addEventListener(eventName, () => {
			document.body.classList.remove('highlight')
		}, false)
	});

	document.body.addEventListener('drop', ({dataTransfer}) => {
		const {files} = dataTransfer;
		handleFilesWrapper(files);
	}, false);

	const list = await loadData();
	
	list.map(({id, image})=>{
		const li =  document.createElement("li");
		li.id = id;
		li.setAttribute("data-image",image.medium);
		li.setAttribute("data-image-fullsize",image.fullsize);
		li.addEventListener("hasToBeDisplayed", displayPicture, false);
		li.addEventListener("hasToBeErrored", errorPicture, false);
		document.querySelector("ul#imageList").appendChild(li);
		hasToDiplayPicture(li);
	});
	window.addEventListener("scroll", hasToDiplayPictures, false);
	window.addEventListener("resize", hasToDiplayPictures, false);
});

const hasToDiplayPictures = ()=>{
	[...document.querySelectorAll("ul#imageList li[data-image]:not(data-image-loading)")]
	.map(item=>hasToDiplayPicture(item));
}

const hasToDiplayPicture = item => {
	if(isVisible(item)){
		const img = new Image();
		img.onload = () => item.dispatchEvent(new Event("hasToBeDisplayed"));
		img.onerror = () => item.dispatchEvent(new Event("hasToBeErrored"));
		img.src = item.getAttribute("data-image");
		item.setAttribute("data-image-loading",true);
	}
}

const errorPicture = ({target}) => {
	target.parentElement?.removeChild(target);
	hasToDiplayPictures();
}

const displayPicture = ({target}) => {
	target.removeEventListener("hasToBeDisplayed", displayPicture, false);
	target.removeEventListener("hasToBeErrored", errorPicture, false);
	target.style.backgroundImage = `url(${target.getAttribute("data-image")})`;
	target.removeAttribute("data-image");
	target.removeAttribute("data-image-loading");
}




