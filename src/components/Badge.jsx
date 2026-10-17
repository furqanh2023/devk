import React from 'react';export default function Badge({children,tone='neutral',dot=false}){return <span className={`badge badge-${tone}`}>{dot&&<i/>}{children}</span>}
