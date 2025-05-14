import React, { Suspense } from 'react'
import {PacmanLoader} from "react-spinners"

const Layout = ({ children }) => {
    return (
        <div className="px-5">
                <Suspense fallback={<PacmanLoader className='mt-4' width={"100%"} color="gray"/>}>
                    {children}
                </Suspense>
            </div>

    )
}

export default Layout