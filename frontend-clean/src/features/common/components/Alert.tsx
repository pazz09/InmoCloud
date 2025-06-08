'use client'
export default function Alert(msg: string) {
  return(
  <div
    className="alert alert-danger fade show text-center"
    role="alert"
  >
    {msg}
  </div>
  )

}
