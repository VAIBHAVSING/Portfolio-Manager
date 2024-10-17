import {atom} from "recoil"
export const UserAtom=atom({
    key:"UserAtom",
    default:{
        id:"",
        email:"",
        username:"",
        name:"",
        image:""
    }
});