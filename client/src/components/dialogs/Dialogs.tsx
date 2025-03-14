import ChallengesDialog from '@/components/dialogs/challenges/ChallengesDialog'
import FileManagerDialog from '@/components/dialogs/fileManager/FileManagerDialog'
import LoginDialog from '@/components/dialogs/login/LoginDialog'
import ProfileDialog from '@/components/dialogs/profile/ProfileDialog'
import ProductDialog from '@/components/dialogs/runes/ProductDialog'
import ShopDialog from '@/components/dialogs/shop/ShopDialog'
import React from 'react'
import InventoryDialog from './inventory/InventoryDialog'
import UpgradeDialog from './upgrade/UpgradeDialog'

const Dialogs: React.FC = () => {
  return (
    <>
      <ShopDialog />
      <ProfileDialog />
      <LoginDialog />
      <FileManagerDialog />
      <ChallengesDialog />
      <ProductDialog />
      <InventoryDialog />
      <UpgradeDialog />
    </>
  )
}

export default Dialogs
