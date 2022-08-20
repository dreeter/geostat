

function convertUTCToTime(UTCDate){

    const date = new Date();

    date.setUTCSeconds(UTCDate);

    return date.toTimeString().substring(0, 17);


}

async function renderMustacheTemplate(file, value){

    const template = await getMustacheTemplate(file);
    const renderedHTML = Mustache.render(template, value);

    return renderedHTML;
}

async function getMustacheTemplate(file){

    const response = await fetch(file);
    const template = await response.text();

    return template;
}

export {convertUTCToTime, renderMustacheTemplate}