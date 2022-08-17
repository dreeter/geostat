

export function convertUTCToTime(UTCDate){

    const date = new Date();

    date.setUTCSeconds(UTCDate);

    return date.toTimeString().substring(0, 17);


}


export async function render(templateFile, value){

    const template = await getTemplate(templateFile);
    const rendered = Mustache.render(template, value);

    return rendered;
}

async function getTemplate(file){

    const response = await fetch(file);

    const template = await response.text();

    return template;

}