import React, { memo } from 'react'
import Styles from './footer-styles.scss'

type Props = React.HTMLAttributes<HTMLElement>

const Footer: React.FC = () => {
  return (
    <footer className={Styles.footer}></footer>)
}

export default memo(Footer)
