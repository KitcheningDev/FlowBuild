const fs = require('fs');

// Read the content of the file
fs.readFile('src/ts/server.ts', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Replace the values
    data = data.replace(
        /const DEFAULT_API_RECIPE = config.DEFAULT_API_RECIPE;/g,
        'const DEFAULT_API_RECIPE = prodConfig.DEFAULT_API_RECIPE;'
    );
    data = data.replace(
        /const DEFAULT_API_TAG = config.DEFAULT_API_TAG;/g,
        'const DEFAULT_API_TAG = prodConfig.DEFAULT_API_TAG;'
    );
    data = data.replace(
        /const DEFAULT_API_INGREDIENT = config.DEFAULT_API_INGREDIENT;/g,
        'const DEFAULT_API_INGREDIENT = prodConfig.DEFAULT_API_INGREDIENT;'
    );
    data = data.replace(
        /const DEFAULT_API_TASK = config.DEFAULT_API_TASK;/g,
        'const DEFAULT_API_TASK = prodConfig.DEFAULT_API_TASK;'
    );
    data = data.replace(
        /const DEFAULT_API_IMAGES = config.DEFAULT_API_IMAGES;/g,
        'const DEFAULT_API_IMAGES = prodConfig.DEFAULT_API_IMAGES;'
    );

    // Write the updated content back to the file
    fs.writeFile('src/ts/server.ts', data, 'utf8', (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('File updated successfully.');
        }
    });
});
