import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface NavbarProps {
  links: string[];
  ctaText?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
const Navbar: React.FC<NavbarProps> = ({ links, ctaText }) => {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  return (
    <div className="bg-black w-full xl:grid xl:place-items-center">
      <nav className="bg-black text-slate-200 lg:flex xl:container">
        <div className="flex">
          <a className="m-4 text-2xl font-bold " href="#home">YourName</a>
          <button className="px-4 my-2 mx-4 ml-auto font-bold rounded hover:bg-slate-800 hover:text-white lg:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>Menu</button>
        </div>
        <ul className={(showMobileMenu ? "" : "hidden") + " lg:ml-auto lg:flex"}>
          {links.map(str => <NavLink key={str} text={str} />)}
          <li className="py-2 grid place-items-center lg:mx-5"><a href="#" className="p-2 w-1/2 lg:w-28 text-center rounded font-bold hover:bg-teal-200 bg-teal-300 text-black">{ctaText ?? "Contact"}</a></li>
        </ul>
      </nav>
    </div>
  );
};

interface NavLinkProps {
  text: string;
}

const NavLink: React.FC<NavLinkProps> = ({ text }) => {
  return <li className="py-2 grid place-items-center lg:mx-5"><a href={`#${text.toLowerCase()}`} className="p-2 w-1/2 lg:w-28 text-center rounded font-bold hover:bg-slate-800 hover:text-white">{text}</a></li>;
};

/*
  Create Your Navbar in myNavBar:
  - @links - Array of strings representing nav links.
           - Each <a> link item will have a href of #str.toLowerCase() for page navigation.
  - @ctaText - string to be displayed for call to action link.
*/
const myNavBar = <Navbar links={["Home", "Projects", "Articles", "About"]} ctaText="Contact"/>;

// Render the navbar component to the root div element defined in the HTML file here for viewing purposes.
ReactDOM.render(myNavBar, document.getElementById('root'));
export default Navbar