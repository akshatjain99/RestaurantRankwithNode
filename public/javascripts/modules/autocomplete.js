function autocomplete(input, latInput, lngInput){
  if(!input) return; //if there is no input on the page tehn skip this function 
  const dropdown=new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', ()=>{
    const place=dropdown.getPlace();
    latInput.value=place.geometry.location.lat();
    lngInput.value=place.geometry.location.lng();
  })

  //If someone hits enter on the adress field dropdown do not submit the entire form
  input.on('keydown', (e)=>{
    if(e.keyCode===13) e.preventDefault();
  })
}

export default autocomplete;