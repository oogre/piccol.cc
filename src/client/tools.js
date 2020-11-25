/*----------------------------------------*\
  collaborativeImageBoard - tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2020-11-19 12:17:20
  @Last Modified time: 2020-11-25 19:31:17
\*----------------------------------------*/
export const docReady = fn => {
	// see if DOM is already available
	if (document.readyState === "complete" || document.readyState === "interactive") {
		// call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

export const handleFiles = files => {
	return Promise.all(
		([...files]).map(file => uploadFile(file))
	)
}

export const uploadFile = file => {
	const formData = new FormData()
	formData.append('file', file)
	formData.append('boardName', encodeURIComponent(getBoardNameFromLocation()))

	return fetch('/add', {
		method: 'POST',
		body: formData,
	})
	.then(response => response.json())
	.then(data => {
		if(!data.success)return new Error();
		return data;
	})
}
export const removeFile = id => {
	const formData = new FormData()
	formData.append('id', id)
	formData.append('boardName', encodeURIComponent(getBoardNameFromLocation()))

	return fetch('/remove', {
		method: 'POST',
		body: formData,
	})
	.then(response => response.json())
	.then(data => {
		if(!data.success)return new Error();
		return data;
	})
}

export const loadData = () => {
	var url = new URL(`${location.origin}/content`);
	url.search = new URLSearchParams({ boardName : encodeURIComponent(getBoardNameFromLocation()) }).toString();
	return fetch(url)
	.then(response => response.json())
	.then(data => {
		if(!data.success)return new Error("");
		return data;
	})
	.then(({content}) => content);
}

export const listBoard = async () => {
	var url = new URL(`${location.origin}/list`);
	return fetch(url)
	.then(response => response.json())
	.then(data => {
		if(!data.success)return new Error("");
		return data;
	})
	.then(({content}) => content);
}

export const submitInit = ({target}) => {
	var url = new URL(`${location.origin}/init`);
	return fetch(url, {
		method: 'POST',
		body : new FormData(target)
	})
	.then(response => response.json())
	.then(data => {
		if(!data.success)return new Error("");
		return data;
	});
}

export const isVisible = (elem) => {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemTopLeft   = {
        x: elem.getBoundingClientRect().left,
        y: elem.getBoundingClientRect().top
    };

    if (elemTopLeft.x < 0) return false;
    if (elemTopLeft.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemTopLeft.y < 0) return false;
    if (elemTopLeft.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemTopLeft.x, elemTopLeft.y);
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer && (pointContainer = pointContainer.parentNode));
    return false;
}

export const getBoardNameFromLocation = ()=>{
	return decodeURIComponent(location.href.substring(location.protocol.length+2+location.host.length+1));
}