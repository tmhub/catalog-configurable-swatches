<?php

class TM_CatalogConfigurableSwatches_Helper_Data extends Mage_Core_Helper_Abstract
{
    public function isEnabled()
    {
        return Mage::helper('core')->isModuleOutputEnabled('Mage_ConfigurableSwatches')
            && Mage::getStoreConfigFlag('configswatches/general/enabled');
    }
}
