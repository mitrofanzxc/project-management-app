import { FC, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '../../../shared/constants/routes';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { saveTokenToLS } from '../../../features/ls-load-save';
import { logoutUser } from '../../../reducers/auth';
import decodeUserId from '../../../features/decodeUserId';
import { useGetUserByIdQuery, usePostBoardMutation } from '../../../app/RtkQuery';
import { setEmptyUser, setUserData } from '../../../reducers/userReducer';
import { PrimaryButton, TertiaryButton } from '../../buttons';

import './Header.scss';

const getRandomTitleBoard = () => Math.floor(Math.random() * 100).toString();

const Header: FC = () => {
  const [postBoard] = usePostBoardMutation();
  const [scrolledPage, isScrolledPage] = useState(false);
  const body = window.document.body as HTMLBodyElement;
  const heightScrollTop = 1;
  const navigate = useNavigate();
  const location = useLocation();
  const { userToken } = useAppSelector((state) => state.authStorage);
  const { userName } = useAppSelector((state) => state.userStorage);
  const dispatch = useAppDispatch();

  const listenScrollEvent = () => {
    body.scrollTop > heightScrollTop ? isScrolledPage(true) : isScrolledPage(false);
  };

  const userId = decodeUserId(userToken); // receive userId
  const { data } = useGetUserByIdQuery(userId);

  const addNewBoard = async () =>
    await postBoard({ title: getRandomTitleBoard(), description: "it's a description" });

  useEffect(() => {
    if (data && 'name' in data && 'id' in data && 'login' in data) {
      dispatch(
        setUserData({
          userName: data.name,
          userId: data.id,
          userLogin: data.login,
        })
      );
    }
  }, [userId, data]);

  useEffect(() => {
    body.addEventListener('scroll', listenScrollEvent);
    return () => body.removeEventListener('scroll', listenScrollEvent);
  }, [scrolledPage]);

  return (
    <header data-testid="header" className={'header' + (scrolledPage ? ' header-scrolled' : '')}>
      <div className="wrapper header__wrapper">
        <div className="header__logo__wrapper">
          <Link to={PATHS.main} className={'header__logo' + (userToken ? ' border-right' : '')} />
          {userToken && (
            <>
              <Link
                to={PATHS.boards}
                className={location.pathname === '/boards' ? 'border-right' : ''}
              >
                <div className="boards-logo__wrapper">
                  <div className="boards-logo" />
                  <div className="boards-logo-description">Boards</div>
                </div>
              </Link>
              {location.pathname === '/boards' && (
                <TertiaryButton
                  className="button__tertiary"
                  type="button"
                  description="+ Create a new board"
                  onClick={addNewBoard}
                />
              )}
            </>
          )}
        </div>
        <div className="header__buttons">
          {!userToken && (
            <>
              <PrimaryButton
                dataTestId="PrimaryButton"
                type="button"
                className="btn btn-log btn-bordered"
                description="Sign In"
                onClick={() => navigate(PATHS.signIn, { replace: true })}
              />
              <PrimaryButton
                dataTestId="PrimaryButton"
                type="button"
                className="btn btn-sign btn-colored"
                description="Sign up"
                onClick={() => navigate(PATHS.signUp, { replace: true })}
              />
            </>
          )}
          {userToken && (
            <>
              <div
                className="boards-logo__wrapper"
                role="button"
                onClick={() => navigate(PATHS.userProfile)}
              >
                <div className="boards-logo user-logo" />
                <div className="boards-logo-description">{userName}</div>
              </div>
              <PrimaryButton
                dataTestId="PrimaryButton"
                type="button"
                className="btn btn-sign btn-colored"
                description="Sign out"
                onClick={() => {
                  dispatch(logoutUser());
                  dispatch(setEmptyUser());
                  saveTokenToLS('');
                  console.log('logout');
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
