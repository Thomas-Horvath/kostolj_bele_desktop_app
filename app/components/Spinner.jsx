import style from "../styles/spinner.module.scss"

const Spinner = () => {
    return (
        <div className={style.spinner_container}>
            <div className={style.spinner}></div>
        </div>
    )
}

export default Spinner