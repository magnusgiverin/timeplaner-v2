'use client';

const Navbar = () => {

    return (
        <nav className="fixed top-0 left-0 z-50 py-4 px-4 md:px-8 flex justify-between items-center pb-8">
            <span className="flex flex-row gap-8">
                <h2 className="text-deep-dark font-bold">Timeplaner</h2>
            </span>
        </nav>
    );
}

export default Navbar;