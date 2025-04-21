function sanitizeId(str) {
  let id = str.replace(/[^a-z0-9_\-]/gi, '_');
  // If the id starts with a digit, prefix it with a letter.
  if (/^\d/.test(id)) {
    id = 'id_' + id;
  }
  return id;
}

function showHtml(fileName, containerClass, start, end) {
  // Create a safe version of the file name for use in element IDs
  const safeId = sanitizeId(fileName);

  const fileHtml = `${fileName}.html`;
  const fileMd = `${fileName}.md`;

  let $target;
  if (containerClass == undefined){
    $target = 'body'
  } else {
   $target = `.${containerClass}`
  }

  // Use safeId for element IDs and append all needed elements
  $(`<div id='${safeId}_md'></div>`).appendTo($target);
  $(`<iframe width="100%" height="250" src="${fileHtml}" title="${fileName}"></iframe>`).appendTo($target);
  $(`<form action="https://jsfiddle.net/api/post/library/pure/" method="post" target="_blank">
      <textarea hidden type="text" id="${safeId}_jsfiddle_html" name="html"></textarea><br>
      <input type="submit" value="Edit in JSFiddle">
    </form>`).appendTo($target);
  $(`<div id='${safeId}_html' style='position: relative'></div>`).appendTo($target);

  // handle creating html code + button
  $.get(fileHtml, (content) => {
    $(`#${safeId}_jsfiddle_html`).val(content);
    $(`#${safeId}_html`).html(window.markdownit().render(
      `\`\`\`html\n${content.split('\n').slice(start, end).join('\n')}\n\`\`\``
    ));
    $(`#${safeId}_html pre code`).each((index, element) => {
      hljs.highlightElement(element);

      // Create the copy button and style it to be at the top right.
    const $copyBtn = $('<button>Copy</button>');
      $copyBtn.css({
        position: 'absolute',
        top: '5px',
        right: '5px',
        zIndex: 10
      });
  
    $copyBtn.on('click', () => {
      const codeText = $(element).text();
      navigator.clipboard.writeText(codeText)
        .then(() => {
          $copyBtn.text('Copied!');
          setTimeout(() => {
            $copyBtn.text('Copy');
          }, 2000);
        });
    });
  
      // Append the button to the container div
      const $pre = $(element).parent();
      $pre.parent().append($copyBtn);
    });
  });

  // handle creating markdown code + button
  $.get(fileMd)
    .done((content) => {
      $(`#${safeId}_md`).html(window.markdownit().render(content));
      $(`#${safeId}_md pre code`).each((index, element) => {
        hljs.highlightElement(element);

        const $pre = $(element);
        // Wrap the <pre> in a container if not already wrapped
        if (!$pre.parent().hasClass('code-container')) {
          $pre.wrap('<div class="code-container" style="position: relative;"></div>');
        }
        const $container = $pre.parent();
        
        // Create the copy button and style it to appear in the top right
        const $copyBtn = $('<button>Copy</button>');
        $copyBtn.css({
          position: 'absolute',
          top: '5px',
          right: '5px',
          zIndex: 10
        });
        
        $copyBtn.on('click', () => {
          const codeText = $pre.find('code').text();
          navigator.clipboard.writeText(codeText)
            .then(() => {
              $copyBtn.text('Copied!');
              setTimeout(() => {
                $copyBtn.text('Copy');
              }, 2000);
          });
      });
      
      // Append the copy button to the container
      $container.append($copyBtn);
      });
    })
    .fail(() => {
      $(`#${safeId}_md`).html(`<h2>${fileName}</h2>`);
    });
}

// NOTE: must contain extension
function showJS(fileName, containerClass) {
  // Create a safe version of the file name for use in element IDs
  const safeId = sanitizeId(fileName);

  // Determine target container as a jQuery object
  let $target;
  if (containerClass === undefined) {
    $target = $('body');
  } else {
    $target = $(`.${containerClass}`);
  }

  // Create the container for code
  $(`<div id="${safeId}_container" style="position: relative;"></div>`).appendTo($target);

  // Retrieve the newly created container as a jQuery object
  let $container = $(`#${safeId}_container`);

  // Append the <pre><code> block inside the container
  $(`<pre><code class="language-javascript" id="${safeId}_code"></code></pre>`).appendTo($container);

    // Fetch file content
  $.get(fileName, (content) => {
    // Insert the file content as text (this safely escapes HTML)
    $(`#${safeId}_code`).text(content);

    // Apply syntax highlighting to the specific code element
    hljs.highlightElement(document.getElementById(`${safeId}_code`));

    // // Create the copy button and style it (positioned at the top-right of the container)
    const $copyBtn = $('<button>Copy</button>');
    $copyBtn.css({
      position: 'absolute',
      top: '5px',
      right: '5px',
      zIndex: 10
    });

    // Append the copy button to the container
    $(`#${safeId}_container`).append($copyBtn);

  //  Set up the copy button click event to copy the code text to the clipboard
    $copyBtn.on('click', () => {
      const codeText = $(`#${safeId}_code`).text();
      navigator.clipboard.writeText(codeText)
        .then(() => {
          $copyBtn.text('Copied!');
          setTimeout(() => {
            $copyBtn.text('Copy');
          }, 2000);
        })
        .catch((error) => {
          console.error('Copy failed:', error);
        });
    });
  }, 'text').fail((error) => {
    console.error('Error loading file:', error);
});  
}

// used in entry demos:
let codeArray;
function showCode(...c) {
  codeArray = c;

  for (let i = 0; i < c.length; i++) {
    document.getElementById('code' + i).textContent = c[i];
  }
}

function copyCode(index) {
  navigator.clipboard.writeText(codeArray[index]);
}

function runCode(index) {
  eval('"use strict";' + codeArray[index]);
}
