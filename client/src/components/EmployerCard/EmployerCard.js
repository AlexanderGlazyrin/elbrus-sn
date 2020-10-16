import React from 'react';
import {Card} from 'antd';
import RateComponent from '../Rate/RateComponent';
import style from './EmployerCard.module.css'

const EmployerCard = ({employer}) => {
  const rating = employer.allReviews.reduce(((sum, el) => sum + el.rating), 0) / employer.allReviews.length

  return (
    <>
      <Card
        className={style.card}
        type="inner"
        title={employer.name}
        extra={<a href="#">More</a>}>
        <RateComponent
          span={0} rate={rating}
          disabled={true}
          title='Рейтинг работодателя: '
          justify='left'/>
      </Card>
    </>
  );
};

export default EmployerCard;
