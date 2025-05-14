import React, { Suspense } from 'react'
import {PacmanLoader} from "react-spinners"

const Layout = ({ children }) => {
    return (
        <div className="px-5">
            <div className="flex items-center justify-between mb-5">
                <h1 className='text-6xl font-bold gradient-title'>Industry Insights</h1>
            </div>
            <div>
                <Suspense fallback={<PacmanLoader className='mt-4' width={"100%"} color="gray"/>}>
                    {children}
                </Suspense>
            </div>
        </div>

    )
}

export default Layout