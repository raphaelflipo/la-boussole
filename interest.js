'use strict';
const form=document.getElementById('interest-form');
const result=document.getElementById('interest-result');
form.addEventListener('submit',event=>{event.preventDefault();result.textContent=['Fiche locale préparée. Rien n’a été envoyé.',...['interest-type','interest-size','interest-goal','interest-device'].map(id=>document.getElementById(id).value)].join(' · ');result.hidden=false;});
form.addEventListener('reset',()=>{result.hidden=true;result.textContent='';});
