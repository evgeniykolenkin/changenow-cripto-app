import { useState, useEffect } from "react";
import axios from "axios";
import swap from "../assets/swap.png";
import styles from "./ChangeNow.module.css";
import cn from "classnames";

const API_KEY =
  "c9155859d90d239f909d2906233816b26cd8cf5ede44702d422667672b58b0cd";
const API_URL = "https://changenow.io/api/v1";

export const ChangeNow = () => {
  const [currencies, setCurrencies] = useState([]);
  const [leftCurrency, setLeftCurrency] = useState("");
  const [rightCurrency, setRightCurrency] = useState("");
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [exchangeAmount, setExchangeAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/currencies?api_key=${API_KEY}`
        );
        setCurrencies(response.data);
      } catch (error) {
        console.error("Can't load currencies:", error);
        setErrorMessage(error.message);
      }
    };

    fetchCurrencies();
  }, []);

  useEffect(() => {
    const fetchMinimumAmount = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/min-amount/${leftCurrency}_${rightCurrency}?api_key=${API_KEY}`
        );
        setMinimumAmount(response.data.minAmount);
        setErrorMessage("");
      } catch (error) {
        console.warn("Can't load min-amount:", error);
        setErrorMessage("This pair is disabled now");
        setMinimumAmount(0);
        setExchangeAmount(0);
      }
    };

    if (leftCurrency && rightCurrency) {
      fetchMinimumAmount();
    }
  }, [leftCurrency, rightCurrency]);

  useEffect(() => {
    const fetchExchangeAmount = async () => {
      if (leftCurrency && rightCurrency && minimumAmount) {
        try {
          const response = await axios.get(
            `${API_URL}/exchange-amount/${minimumAmount}/${leftCurrency}_${rightCurrency}/?api_key=${API_KEY}`
          );
          setExchangeAmount(response.data.estimatedAmount);
          setErrorMessage("");
        } catch (error) {
          console.warn("Can't load exchange-mount:", error);
          setErrorMessage("This pair is disabled now");
          setMinimumAmount(0);
          setExchangeAmount(0);
        }
      } else {
        setExchangeAmount(0);
      }
    };

    fetchExchangeAmount();
  }, [leftCurrency, rightCurrency, minimumAmount]);

  const handleLeftCurrencyChange = (event) => {
    setLeftCurrency(event.target.value);
  };

  const handleRightCurrencyChange = (event) => {
    setRightCurrency(event.target.value);
  };

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value);
    setMinimumAmount(amount);
  };

  return (
    // общий контейнер
    <div className={styles.container}>
      {/* контент всего приложения */}
      <div className={styles.app}>
        {/* заголовки */}
        <div className={styles.app__header}>
          <h1 className={styles.app__header_title}>Crypto Exchange</h1>
          <p className={styles.app__header_subtitle}>Exchange fast and easy</p>
        </div>

        {/* интерфейс обмена */}
        <div className={styles.exchange}>
          <div className={styles.exchange__item}>
            <input
              className={styles.exchange__item_common}
              value={minimumAmount || ""}
              onChange={handleAmountChange}
            />

            {/* левая валюта */}
            {leftCurrency && (
              <img
                src={currencies
                  .filter((item) => item.ticker === leftCurrency)
                  .map((item) => item.image)}
                alt="currency-img"
              />
            )}
            <select
              className={styles.exchange__item_common}
              value={leftCurrency}
              onChange={handleLeftCurrencyChange}
            >
              <option value="">Сurrency</option>
              {currencies.map((currency) => (
                <option key={currency.ticker} value={currency.ticker}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>
          <button className={styles.swap__btn}>
            <img src={swap}></img>
          </button>
          <div className={styles.exchange__item}>
            <input
              className={styles.exchange__item_common}
              type="text"
              value={exchangeAmount || "-"}
              readOnly
            />

            {/* правая валюта */}
            {rightCurrency && (
              <img
                src={currencies
                  .filter((item) => item.ticker === rightCurrency)
                  .map((item) => item.image)}
                alt="currency-img"
              />
            )}

            <select
              className={styles.exchange__item_common}
              value={rightCurrency}
              onChange={handleRightCurrencyChange}
            >
              <option value="">Сurrency</option>
              {currencies.map((currency) => (
                <option key={currency.ticker} value={currency.ticker}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/*ввод ключа и кнопка обмена?/перевода?*/}
        <div className={styles.apikey__exchange_wrapper}>
          <p className={styles.apikey__text}>
            <span>Your </span>
            {currencies
              .filter((item) => item.ticker === rightCurrency)
              .map((item) => item.name)}
            <span> address for exchange</span>
          </p>
          <div className={styles.exchange__input_btn}>
            <input className={styles.exchange__item} />
            <div>
              <button className={cn(styles.exchange__btn, styles.btn)}>
                Exchange
              </button>
              {errorMessage && <p>{errorMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
