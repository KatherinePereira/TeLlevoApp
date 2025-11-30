export interface Page{
    title:string;
    url:string;
    icon:string;
    action?:() => void;
}