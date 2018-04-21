const axios= require('axios');
const dompurify= require('dompurify');


function searchResultsHTML(stores){
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class='search__result'> 
        <strong> ${store.name}</strong>
      </a>

    `;
  }).join('');
};

function typeAhead(search){
  if(!search) return;

  const searchInput= search.querySelector('input[name="search"]');
  const searchResults= search.querySelector('.search__results');

  searchInput.on('input', function(){
    //if there is no searchInput then hide the searchResults and return
    if(!this.value){
      searchResults.style.display='none';
      return;
    }

    searchResults.style.display='block';
    searchResults.innerHTML= ''; // blow the seacrchresults away if there is nothing to show

    //we use axios to hit our endpoint

    axios
      .get(`/api/search/?q=${this.value}`)
      .then(res=>{
        if(res.data.length){
          console.log('There is something to show');
          const html = searchResultsHTML(res.data);
          searchResults.innerHTML= dompurify.sanitize(html);
          return;
        };

        //tell them nothing returned
        searchResults.innerHTML= dompurify.sanitize(`<div class='search__result'>No Result found for ${this.value}</div>`);
      });
  });

  //handle keyboard inputs

  searchInput.on('keyup', (e)=>{
    //if they are not pressing up, down or enter then we don't care
    if(!([38,40,13].includes(e.keyCode))){
      return;
    };

    const activeClass='search__result--active';
    const current= search.querySelector(`.${activeClass}`);
    const items= search.querySelectorAll('.search__result');
    let next;

    if(e.keyCode===40 && current){
      next= current.nextElementSibling || items[0];
    }else if(e.keyCode===40){
      next= items[0];
    }else if(e.keyCode===38 && current){
      next= current.previousElementSibling || items[items.length -1 ];
    }else if(e.keyCode===38){
      next= items[items.length -1 ];
    }else if(e.keyCode===13 && current.href){
      window.location= current.href;
      return;
    }

    if(current){
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });


};


export default typeAhead;

