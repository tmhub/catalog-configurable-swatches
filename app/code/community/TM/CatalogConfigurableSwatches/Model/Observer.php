<?php

class TM_CatalogConfigurableSwatches_Model_Observer
{
    /**
     * Convert a catalog layer block with the right templates
     * Observes: controller_action_layout_generate_blocks_after
     *
     * @param Varien_Event_Observer $observer
     */
    public function convertLayerBlock(Varien_Event_Observer $observer)
    {
        $front = Mage::app()->getRequest()->getRouteName();
        $controller = Mage::app()->getRequest()->getControllerName();
        $action = Mage::app()->getRequest()->getActionName();

        // Perform this operation if we're on a category view page or search results page
        if (($front == 'attributepages' && $controller == 'page' && $action == 'view')) {
            // Block name for layered navigation differs depending on which Magento edition we're in
            $blockName = 'catalog.leftnav';
            if (Mage::getEdition() == Mage::EDITION_ENTERPRISE) {
                $blockName = 'enterprisecatalog.leftnav';
            }
            Mage::helper('configurableswatches/productlist')->convertLayerBlock($blockName);
        }
    }
}
