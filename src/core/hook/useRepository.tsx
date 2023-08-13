import axios, { AxiosResponse } from "axios";
import {
  PaginationQuery,
  PaginationResponse,
  ResponseTemplate,
} from "../../types/repository/basic.type";
import { useAuth } from "../../context/AuthContext";
import {
  MemberProfile,
  UpdateNicknameForm,
  UpdatePasswordForm,
} from "../../types/User.type";
import { useCallback, useMemo } from "react";
import { LoginForm, RegisterData } from "../../types/Auth.type";
import {
  CreateDestinationForm,
  UpdateDestinationForm,
  DestinationResponse,
} from "../../types/Destination.type";
import {
  DescriptionType,
  DescriptionForm,
  DescriptionUpdateForm,
  ItemListQuery,
} from "../../types/Description.type";
import { StoreFileName } from "../../types/File.type";
import {
  JourneyCommentForm,
  JourneyCommentType,
  JourneyCommentUpdateForm,
  JourneyContentResponse,
  JourneyForm,
  JourneyResponse,
} from "../../types/Journey.type";
import {
  CreateRoomForm,
  RoomDateQuery,
  RoomType,
  RoomReserveType,
  ReserveRoomForm,
} from "../../types/Room.type";
import {
  CreateCreditCardForm,
  DepositToTravelPayForm,
  PaymentMethodInFoType,
} from "../../types/Payment.type";
import QueryString from "qs";
import { RoomOrderType } from "../../types/Order.type";

const serverErrorTemplateGenerator = <K,>(): ResponseTemplate<K> => {
  return {
    success: false,
    response: null,
    error: {
      status: 500,
      message: "서버에 문제가 발생했습니다.",
      bindingErrors: [],
    },
  };
};

const JWT_KEY = "jwt";

type QueryOptions<P, Q> = {
  pathVariable?: P;
  query?: Q;
};

class Repository {
  private defaultPath: string;
  private httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_HOST,
    timeout: 5000,
    withCredentials: true,
    headers: {
      accept: "application/json",
    },
  });

  private checkAuthFunc: (response: ResponseTemplate<Object>) => void;

  constructor(
    defaultPath: string,
    checkAuthFunc: (response: ResponseTemplate<Object>) => void
  ) {
    this.defaultPath = defaultPath;
    this.checkAuthFunc = checkAuthFunc;
  }

  public getHttpClient = () => {
    return this.httpClient;
  };

  public createPost = <T, R extends Object, P = undefined, Q = undefined>(
    path: string,
    disableCheck = false
  ) => {
    return async (request: T, options?: QueryOptions<P, Q>) => {
      let convertedPath = path;
      if (options) {
        if (options.pathVariable) {
          const splitPath = path.split("{pv}");
          const applyPath = `${splitPath[0]}${options.pathVariable}${splitPath[1]}`;
          convertedPath = applyPath;
        }
        if (options.query instanceof Object) {
          if ("page" in options.query) {
            const page = options.query["page"] as number;
            options.query = {
              ...options.query,
              page: page - 1,
            };
          }
        }
        const qs = QueryString.stringify(options.query, {
          arrayFormat: "repeat",
        });
        convertedPath += `?${qs}`;
      }

      try {
        const response = await this.httpClient.post<
          T,
          AxiosResponse<ResponseTemplate<R>>
        >(this.defaultPath + convertedPath, request, {
          headers: { authorization: `bearer ${localStorage.getItem(JWT_KEY)}` },
        });
        const data = response.data;
        if (!disableCheck) {
          this.checkAuthFunc(data);
        }
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<R>();
      }
    };
  };

  public createGet = <R extends Object, P = undefined, Q = undefined>(
    path: string,
    disableCheck = false
  ) => {
    return async (options?: QueryOptions<P, Q>) => {
      let convertedPath = path;
      if (options) {
        if (options.pathVariable) {
          const splitPath = path.split("{pv}");
          const applyPath = `${splitPath[0]}${options.pathVariable}${splitPath[1]}`;
          convertedPath = applyPath;
        }
        if (options.query instanceof Object) {
          if ("page" in options.query) {
            const page = options.query["page"] as number;
            options.query = {
              ...options.query,
              page: page - 1,
            };
          }
        }
        const qs = QueryString.stringify(options.query, {
          arrayFormat: "repeat",
        });
        convertedPath += `?${qs}`;
      }
      try {
        const response = await this.httpClient.get<
          void,
          AxiosResponse<ResponseTemplate<R>>
        >(this.defaultPath + convertedPath, {
          headers: { authorization: `bearer ${localStorage.getItem(JWT_KEY)}` },
        });
        const data = response.data;
        if (!disableCheck) {
          this.checkAuthFunc(data);
        }
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<R>();
      }
    };
  };
}

/**
 * 세션 만료 검증
 * 토큰이 만료됐으면 메모리에 저장돼있는 유저 정보 제거함
 * @returns checkAuthByResponse
 */
const useCheckAuthByResponse = () => {
  const { user, logout } = useAuth();

  const checkAuthByResponse = useCallback(
    (response: ResponseTemplate<Object>) => {
      if (response.error && response.error.status === 401) {
        if (user !== null) {
          logout();
        }
      }
    },
    [logout, user]
  );

  return checkAuthByResponse;
};

const useAuthRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/auth", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const postLogin = useMemo(
    () => repository.createPost<LoginForm, MemberProfile>("/login"),
    [repository]
  );

  const postLogout = useMemo(
    () => repository.createPost<void, "ok">("/logout", true),
    [repository]
  );

  const postRegister = useMemo(
    () => repository.createPost<RegisterData, "ok">("/register", true),
    [repository]
  );

  const repo = useMemo(
    () => ({
      postLogin,
      postLogout,
      postRegister,
    }),
    [postLogin, postLogout, postRegister]
  );

  return repo;
};

const useUserRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/members", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const postNickname = useMemo(
    () => repository.createPost<UpdateNicknameForm, "ok">("/nickname"),
    [repository]
  );

  const postPassword = useMemo(
    () => repository.createPost<UpdatePasswordForm, "ok">("/password"),
    [repository]
  );

  const getUserDestinations = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DestinationResponse>,
      undefined,
      ItemListQuery
    >("/destinations", true);
  }, [repository]);

  const getUserDescriptions = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DescriptionType>,
      undefined,
      PaginationQuery
    >("/descriptions");
  }, [repository]);

  const getUserJourneys = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyResponse>,
      undefined,
      PaginationQuery
    >("/journeys");
  }, [repository]);

  const getUserComments = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyCommentType>,
      undefined,
      PaginationQuery
    >("/comments");
  }, [repository]);

  const repo = useMemo(
    () => ({
      postNickname,
      postPassword,
      getUserDescriptions,
      getUserJourneys,
      getUserComments,
      getUserDestinations,
    }),
    [
      getUserComments,
      getUserDescriptions,
      getUserDestinations,
      getUserJourneys,
      postNickname,
      postPassword,
    ]
  );

  return repo;
};

const useDestinationRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/destinations", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getDestinations = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DestinationResponse>,
      undefined,
      ItemListQuery
    >("", true);
  }, [repository]);

  const getDestination = useMemo(() => {
    return repository.createGet<DestinationResponse, string>("/{pv}", true);
  }, [repository]);

  const getDestinationThumnails = useMemo(() => {
    return repository.createGet<
      PaginationResponse<StoreFileName>,
      string,
      PaginationQuery
    >("/{pv}/thumbnails");
  }, [repository]);

  const postDestination = useMemo(
    () => repository.createPost<CreateDestinationForm, "ok">(""),
    [repository]
  );

  const updateDestination = useMemo(() => {
    return repository.createPost<UpdateDestinationForm, "ok", "ok", string>(
      "/{pv}"
    );
  }, [repository]);

  const deleteDestination = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/destinations/${id}`,
            {
              headers: {
                authorization: `bearer ${localStorage.getItem(JWT_KEY)}`,
              },
            }
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const getDescriptions = useMemo(() => {
    return repository.createGet<
      PaginationResponse<DescriptionType>,
      string,
      PaginationQuery
    >("/{pv}/descriptions");
  }, [repository]);

  const postDescription = useMemo(() => {
    return repository.createPost<DescriptionForm, DescriptionType, string>(
      "/{pv}/descriptions"
    );
  }, [repository]);

  const repo = useMemo(
    () => ({
      postDestination,
      updateDestination,
      deleteDestination,
      getDestination,
      getDestinationThumnails,
      getDestinations,
      getDescriptions,
      postDescription,
    }),
    [
      postDestination,
      updateDestination,
      deleteDestination,
      getDestination,
      getDestinationThumnails,
      getDestinations,
      getDescriptions,
      postDescription,
    ]
  );

  return repo;
};

const useDescriptionRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/descriptions", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const updateDescription = useMemo(() => {
    return repository.createPost<
      DescriptionUpdateForm,
      DescriptionType,
      string
    >("/{pv}");
  }, [repository]);

  const deleteDescription = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/descriptions/${id}`,
            {
              headers: {
                authorization: `bearer ${localStorage.getItem(JWT_KEY)}`,
              },
            }
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(
    () => ({
      updateDescription,
      deleteDescription,
    }),
    [deleteDescription, updateDescription]
  );

  return repo;
};

const useFileRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/files", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const postRemove = useCallback(
    async (storeFileName: string) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/files/${storeFileName}`,
            {
              headers: {
                authorization: `bearer ${localStorage.getItem(JWT_KEY)}`,
              },
            }
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(() => ({ postRemove }), [postRemove]);

  return repo;
};

const useJourneyRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/journeys", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getJourneyContent = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyContentResponse>,
      undefined,
      PaginationQuery
    >("/contents", false);
  }, [repository]);

  const getAllJourney = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyResponse>,
      undefined,
      PaginationQuery
    >("", false);
  }, [repository]);

  const getJourney = useMemo(() => {
    return repository.createGet<JourneyResponse, string>("/{pv}", false);
  }, [repository]);

  const postJourney = useMemo(
    () => repository.createPost<JourneyForm, "ok">(""),
    [repository]
  );

  const updateJourney = useMemo(
    () => repository.createPost<JourneyForm, "ok", string>("/{pv}"),
    [repository]
  );

  const deleteJourney = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/journeys/${id}`,
            {
              headers: {
                authorization: `bearer ${localStorage.getItem(JWT_KEY)}`,
              },
            }
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  //코멘트 추가후에 ui 상에서 추가해줘야함
  //이때 데이터를 서버에서 안주면 id, 생성일 등을 무작위로 만들어서 저장해야함
  //이후에 복잡해지므로 서버에서 생성 후 반환으로 데이터 넘기도록 변경
  const postComment = useMemo(() => {
    return repository.createPost<
      JourneyCommentForm,
      JourneyCommentType,
      JourneyCommentType,
      string
    >("/{pv}/comments");
  }, [repository]);

  const getComments = useMemo(() => {
    return repository.createGet<
      PaginationResponse<JourneyCommentType>,
      string,
      PaginationQuery
    >("/{pv}/comments");
  }, [repository]);

  const updateComment = useMemo(() => {
    return repository.createPost<
      JourneyCommentUpdateForm,
      JourneyCommentType,
      string
    >("/comments/{pv}");
  }, [repository]);

  const deleteComment = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/journeys/comments/${id}`,
            {
              headers: {
                authorization: `bearer ${localStorage.getItem(JWT_KEY)}`,
              },
            }
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(
    () => ({
      getJourneyContent,
      getAllJourney,
      getJourney,
      postJourney,
      updateJourney,
      deleteJourney,
      postComment,
      getComments,
      updateComment,
      deleteComment,
    }),
    [
      getJourneyContent,
      getAllJourney,
      getJourney,
      postJourney,
      updateJourney,
      deleteJourney,
      postComment,
      getComments,
      updateComment,
      deleteComment,
    ]
  );

  return repo;
};

const useAccommodationRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/accommodations", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getRoomsForReserve = useMemo(() => {
    return repository.createGet<RoomReserveType[], string, RoomDateQuery>(
      "/{pv}"
    );
  }, [repository]);

  const getRoomsByProducer = useMemo(() => {
    return repository.createGet<
      PaginationResponse<RoomType>,
      void,
      PaginationQuery
    >("/rooms");
  }, [repository]);

  const getRoom = useMemo(() => {
    return repository.createGet<RoomType, number>("/rooms/{pv}");
  }, [repository]);

  const createRoom = useMemo(() => {
    return repository.createPost<CreateRoomForm, "ok", number>("/{pv}");
  }, [repository]);

  const reserveRoom = useMemo(() => {
    return repository.createPost<ReserveRoomForm, "ok", number>("/rooms/{pv}");
  }, [repository]);

  const confirmOrder = useMemo(() => {
    return repository.createPost<void, "ok", number>("/orders/{pv}/confirm");
  }, [repository]);

  const cancelOrder = useMemo(() => {
    return repository.createPost<void, "ok", "ok", number>(
      "/orders/{pv}/cancel"
    );
  }, [repository]);

  const getOrders = useMemo(() => {
    return repository.createGet<
      PaginationResponse<RoomOrderType>,
      undefined,
      PaginationQuery
    >("/orders");
  }, [repository]);

  const getOrdersByRoom = useMemo(() => {
    return repository.createGet<
      PaginationResponse<RoomOrderType>,
      number,
      PaginationQuery
    >("/orders/rooms/{pv}");
  }, [repository]);

  const repo = useMemo(
    () => ({
      getRoomsForReserve,
      getRoomsByProducer,
      createRoom,
      getRoom,
      reserveRoom,
      getOrders,
      confirmOrder,
      cancelOrder,
      getOrdersByRoom,
    }),
    [
      cancelOrder,
      confirmOrder,
      createRoom,
      getOrders,
      getOrdersByRoom,
      getRoom,
      getRoomsByProducer,
      getRoomsForReserve,
      reserveRoom,
    ]
  );

  return repo;
};

const usePaymentRepository = () => {
  const checkAuthByResponse = useCheckAuthByResponse();

  const repository = useMemo(
    () => new Repository("/payment", checkAuthByResponse),
    [checkAuthByResponse]
  );

  const getPaymentMethod = useMemo(() => {
    return repository.createGet<PaymentMethodInFoType>("");
  }, [repository]);

  const depositTravelPay = useMemo(() => {
    return repository.createPost<DepositToTravelPayForm, "ok">("/deposit");
  }, [repository]);

  const createCreditCard = useMemo(() => {
    return repository.createPost<CreateCreditCardForm, number>("");
  }, [repository]);

  const deleteCreditCard = useCallback(
    async (id: number) => {
      try {
        const response = await repository
          .getHttpClient()
          .delete<void, AxiosResponse<ResponseTemplate<"ok">>>(
            `/payment/${id}`,
            {
              headers: {
                authorization: `bearer ${localStorage.getItem(JWT_KEY)}`,
              },
            }
          );
        const data = response.data;
        checkAuthByResponse(data);
        return data;
      } catch (e) {
        return serverErrorTemplateGenerator<"ok">();
      }
    },
    [checkAuthByResponse, repository]
  );

  const repo = useMemo(
    () => ({
      getPaymentMethod,
      depositTravelPay,
      createCreditCard,
      deleteCreditCard,
    }),
    [createCreditCard, deleteCreditCard, depositTravelPay, getPaymentMethod]
  );

  return repo;
};

const useRepository = () => {
  const UserRepository = useUserRepository();
  const AuthRepository = useAuthRepository();
  const DestinationRepository = useDestinationRepository();
  const FileRepository = useFileRepository();
  const JourneyRepository = useJourneyRepository();
  const DescriptionRepository = useDescriptionRepository();
  const AccommodationRepository = useAccommodationRepository();
  const PaymentRepository = usePaymentRepository();

  const repo = useMemo(
    () => ({
      UserRepository,
      AuthRepository,
      DestinationRepository,
      DescriptionRepository,
      FileRepository,
      JourneyRepository,
      AccommodationRepository,
      PaymentRepository,
    }),
    [
      UserRepository,
      AuthRepository,
      DestinationRepository,
      DescriptionRepository,
      FileRepository,
      JourneyRepository,
      AccommodationRepository,
      PaymentRepository,
    ]
  );

  return repo;
};

export default useRepository;
