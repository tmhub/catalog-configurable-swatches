Magento 1.9.1 ConfigurableSwatches integration module
=====================================================

## What does the module do?
1. Add required containers and blocks to the category and product view pages.
2. Add required javascripts and styles.
3. Add support for colorswatches inside AjaxPro or QuickShopping popup on category view page.
4. Add support for AjaxPro or AjaxLayeredNavigation loaded products on the category view page.
5. Fixes some bugs of ConfigurableSwatches module.

## Installation
1. [Deploy files into magento folder](#deploy-module).
3. [Modify templates and copy required files from RWD theme](#required-modifications).
2. [Configure swatches](#configuration).

### Deploy module
**Install with [modman](https://github.com/colinmollenhour/modman)**

    $ cd /path/to/magento
    $ modman clone git@github.com:tmhub/catalog-configurable-swatches.git

**Manual installation**

Unpack archive to the Magento root directory, disable compilation and clear cache.

### Required modifications
**Copy the following files and folders from RWD to your theme:**

> Replace the `PACKAGE/THEME` with your values in commands below. For example default/f001, default/f001_grey.

> If you are planning to use colorswatches on all of your themes, you can replace the `PACKAGE/THEME` with base/default.

    cd /path/to/magento

    # backup files if exists
    mv app/design/frontend/PACKAGE/THEME/layout/configurableswatches.xml app/design/frontend/PACKAGE/THEME/layout/configurableswatches.xml.bak
    mv app/design/frontend/PACKAGE/THEME/template/configurableswatches app/design/frontend/PACKAGE/THEME/template/configurableswatches.bak
    mv app/design/frontend/PACKAGE/THEME/template/catalog/layer/state.phtml app/design/frontend/PACKAGE/THEME/template/catalog/layer/state.phtml.bak
    mv app/design/frontend/PACKAGE/THEME/template/catalog/product/view/type/options/configurable.phtml app/design/frontend/PACKAGE/THEME/template/catalog/product/view/type/options/configurable.phtml.bak

    # copy files from RWD to PACKAGE/THEME
    cp app/design/frontend/rwd/default/layout/configurableswatches.xml app/design/frontend/PACKAGE/THEME/layout/configurableswatches.xml
    cp -r app/design/frontend/rwd/default/template/configurableswatches app/design/frontend/PACKAGE/THEME/template/configurableswatches
    cp app/design/frontend/rwd/default/template/catalog/layer/state.phtml app/design/frontend/PACKAGE/THEME/template/catalog/layer/state.phtml
    cp app/design/frontend/rwd/default/template/catalog/product/view/type/options/configurable.phtml app/design/frontend/PACKAGE/THEME/template/catalog/product/view/type/options/configurable.phtml

    # copy js from rwd to PACKAGE/THEME
    cp -r skin/frontend/rwd/default/js/configurableswatches skin/frontend/PACKAGE/THEME/js/configurableswatches
    mkdir -p skin/frontend/PACKAGE/THEME/js/lib
    cp skin/frontend/rwd/default/js/lib/imagesloaded.js skin/frontend/PACKAGE/THEME/js/lib/imagesloaded.js
    cp skin/frontend/rwd/default/js/lib/modernizr.custom.min.js skin/frontend/PACKAGE/THEME/js/lib/modernizr.custom.min.js

In case if your theme already have these files, please make sure to copy the
colorswatches modifications into your files.

**Open `app/design/frontend/PACKAGE/THEME/template/catalog/product/list.phtml`**
and modify original code in two places (For grid and list modes).

* Add the `id` attribute to the image element:

    ```php
    id="product-collection-image-<?php echo $_product->getId(); ?>"
    ```

* Add the following code below the review summary in list mode and below the
    image in grid mode:

    ```php
    <?php
    // Provides extra blocks on which to hang some features for products in the list
    // Features providing UI elements targeting this block will display directly below the product name
    if ($this->getChild('name.after')) {
        $_nameAfterChildren = $this->getChild('name.after')->getSortedChildren();
        foreach ($_nameAfterChildren as $_nameAfterChildName) {
            $_nameAfterChild = $this->getChild('name.after')->getChild($_nameAfterChildName);
            $_nameAfterChild->setProduct($_product);
            echo $_nameAfterChild->toHtml();
        }
    }
    ?>
    ```

**Open `app/design/frontend/PACKAGE/THEME/template/catalog/product/view/media.phtml`**

* Add the following code to the bottom of the template:

    ```php
    <?php echo $this->getChildHtml('after'); ?>
    ```

### Configuration
1. Navigate to the `System > Configuration > Configurable Swatches > General`,
    enable Magento module and select the options to transform into swatches.

2. Navigate to the `System > Configuration > Catalog > Product Image` and set
    the `Small Image Width` option to match your theme product images size.
