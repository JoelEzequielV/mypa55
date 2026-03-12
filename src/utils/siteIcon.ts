//siteIcon
export const getSiteIcon = (site:string) => {

try{

let url = site.toLowerCase();

url = url.replace("https://","");
url = url.replace("http://","");
url = url.split("/")[0];

return `https://www.google.com/s2/favicons?domain=${url}&sz=64`;

}catch{

return "";

}

};