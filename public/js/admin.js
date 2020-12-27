const deleteProduct = (btn) => {
	const prodId = btn.parentNode.querySelector('[name=productId]').value;
	const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
	const productElement = btn.closest('article');	//reference d closest article elment to clicked button. We wrap each product in an article tag

	fetch('/admin/product/'+prodId, {
		method: 'DELETE',
		headers: {
			'csrf-token': csrf
		}
	})
	.then( result =>{
		// console.log(result);
		return result.json();
	})
	.then(data => {
		productElement.parentNode.removeChild(productElement);
		console.log(data);
	})
	.catch( err => console.log(result));
};