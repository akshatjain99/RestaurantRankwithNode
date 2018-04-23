import axios from 'axios';
import { $, $$ } from './bling';


function ajaxHeart(e){
  e.preventDefault();
  //this is the form tag


  axios
    .post(this.action)
    .then(res=>{
      const isHearted= this.heart.classList.toggle('heart__button--hearted'); //toggle the hearts red and white
      $('.heart-count').textContent= res.data.hearts.length;
      if (isHearted){
        this.heart.classList.add('heart__button--float');
        setTimeout(()=> this.heart.classList.remove('heart__button--float'), 2000);
      };

    })
    .catch(console.error);

}

export default ajaxHeart;