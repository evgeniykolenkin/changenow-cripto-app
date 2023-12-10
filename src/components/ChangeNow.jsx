import { useState, useEffect, useRef } from "react";
import axios from "axios";
import swap from "../assets/swap.png";
import styles from "./ChangeNow.module.css";
import cn from "classnames";
import { CiSearch } from "react-icons/ci";

const API_KEY =
  "c9155859d90d239f909d2906233816b26cd8cf5ede44702d422667672b58b0cd";
const API_URL = "https://changenow.io/api/v1";

export const ChangeNow = () => {
  // * for async requests
  const [currencies, setCurrencies] = useState([]);
  const [leftCurrencyTicker, setLeftCurrencyTicker] = useState("");
  const [rightCurrencyTicker, setRightCurrencyTicker] = useState("");
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [exchangeAmount, setExchangeAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  // * for custon select
  const [selectedLeftCurrency, setSelectedLeftCurrency] = useState("");
  const [selectedRightCurrency, setSelectedRightCurrency] = useState("");
  const [isLeftShowed, setIsLeftShowed] = useState(false);
  const [isRightShowed, setIsRightShowed] = useState(false);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const LeftSelectRef = useRef();
  const RightSelectRef = useRef();

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
          `${API_URL}/min-amount/${leftCurrencyTicker}_${rightCurrencyTicker}?api_key=${API_KEY}`
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

    if (leftCurrencyTicker && rightCurrencyTicker) {
      fetchMinimumAmount();
    }
  }, [leftCurrencyTicker, rightCurrencyTicker]);

  useEffect(() => {
    const fetchExchangeAmount = async () => {
      if (leftCurrencyTicker && rightCurrencyTicker && minimumAmount) {
        try {
          const response = await axios.get(
            `${API_URL}/exchange-amount/${minimumAmount}/${leftCurrencyTicker}_${rightCurrencyTicker}/?api_key=${API_KEY}`
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
  }, [leftCurrencyTicker, rightCurrencyTicker, minimumAmount]);

  useEffect(() => {
    const closeCustomSelect = (e) => {
      if (!LeftSelectRef.current.contains(e.target)) {
        setIsLeftShowed(false);
      }
    };

    document.addEventListener("mousedown", closeCustomSelect);

    return () => {
      document.removeEventListener("mousedown", closeCustomSelect);
    };
  });

  useEffect(() => {
    const closeCustomSelect = (e) => {
      if (!RightSelectRef.current.contains(e.target)) {
        setIsRightShowed(false);
      }
    };

    document.addEventListener("mousedown", closeCustomSelect);

    return () => {
      document.removeEventListener("mousedown", closeCustomSelect);
    };
  });

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value);
    setMinimumAmount(amount);
  };

  const handleLeftCurrencyChange = (e) => {
    setLeftCurrencyTicker(e.target.id);
    setSelectedLeftCurrency(e.target.dataset.name);
    setIsLeftShowed((prev) => !prev);
  };

  const handleRightCurrencyChange = (e) => {
    setRightCurrencyTicker(e.target.id);
    setSelectedRightCurrency(e.target.dataset.name);
    setIsRightShowed((prev) => !prev);
  };

  const openLeftSelectHandler = () => {
    setIsLeftShowed((prev) => !prev);
  };

  const openRightSelectHandler = () => {
    setIsRightShowed((prev) => !prev);
  };

  const leftSelectSearchHandler = (e) => {
    const searchList = currencies.filter((currency) =>
      currency.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setLeftSearch(searchList);
  };

  const rightSelectSearchHandler = (e) => {
    const searchList = currencies.filter((currency) =>
      currency.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setRightSearch(searchList);
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
            {leftCurrencyTicker && (
              <img
                src={currencies
                  .filter((item) => item.ticker === leftCurrencyTicker)
                  .map((item) => item.image)}
                alt="currency-img"
              />
            )}

            <div ref={LeftSelectRef}>
              <button
                title={
                  selectedLeftCurrency
                    ? selectedLeftCurrency
                    : "click to choose"
                }
                onClick={openLeftSelectHandler}
                style={{ width: "100%" }}
                className={styles.select__button}
              >
                {selectedLeftCurrency ? selectedLeftCurrency : "Currency"}
              </button>
              <div style={{ position: "relative", width: "100%" }}>
                <ul
                  className={
                    isLeftShowed ? styles.select__options : styles.hidden
                  }
                >
                  <div className={styles.search__select}>
                    <CiSearch size={25} color="#11b3fe" />
                    <input
                      placeholder="Search..."
                      className={styles.select__input}
                      onChange={leftSelectSearchHandler}
                    />
                  </div>
                  {leftSearch
                    ? leftSearch.map((currency) => (
                        <li
                          onClick={handleLeftCurrencyChange}
                          key={currency.ticker}
                          className={styles.options__item}
                          id={currency.ticker}
                          data-name={currency.name}
                        >
                          {currency.name}
                        </li>
                      ))
                    : currencies.map((currency) => (
                        <li
                          onClick={handleLeftCurrencyChange}
                          key={currency.ticker}
                          className={styles.options__item}
                          id={currency.ticker}
                          data-name={currency.name}
                        >
                          {currency.name}
                        </li>
                      ))}
                </ul>
              </div>
            </div>
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
            {rightCurrencyTicker && (
              <img
                src={currencies
                  .filter((item) => item.ticker === rightCurrencyTicker)
                  .map((item) => item.image)}
                alt="currency-img"
              />
            )}

            <div ref={RightSelectRef}>
              <button
                title={
                  selectedRightCurrency
                    ? selectedRightCurrency
                    : "click to choose"
                }
                onClick={openRightSelectHandler}
                style={{ width: "100%" }}
                className={styles.select__button}
              >
                {selectedRightCurrency ? selectedRightCurrency : "Currency"}
              </button>
              <div style={{ position: "relative" }}>
                <ul
                  className={
                    isRightShowed ? styles.select__options : styles.hidden
                  }
                >
                  <div className={styles.search__select}>
                    <CiSearch size={25} color="#11b3fe" />
                    <input
                      placeholder="Search..."
                      className={styles.select__input}
                      onChange={rightSelectSearchHandler}
                    />
                  </div>
                  {rightSearch
                    ? rightSearch.map((currency) => (
                        <li
                          onClick={handleRightCurrencyChange}
                          key={currency.ticker}
                          className={styles.options__item}
                          id={currency.ticker}
                          data-name={currency.name}
                        >
                          {currency.name}
                        </li>
                      ))
                    : currencies.map((currency) => (
                        <li
                          onClick={handleRightCurrencyChange}
                          key={currency.ticker}
                          className={styles.options__item}
                          id={currency.ticker}
                          data-name={currency.name}
                        >
                          {currency.name}
                        </li>
                      ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/*ввод ключа и кнопка обмена?/перевода?*/}
        <div className={styles.apikey__exchange_wrapper}>
          <p className={styles.apikey__text}>
            <span>Your </span>
            {currencies
              .filter((item) => item.ticker === rightCurrencyTicker)
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
